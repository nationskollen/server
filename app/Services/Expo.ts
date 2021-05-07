/**
 * Implements functions for sending push notifications using the Expo SDK.
 *
 * @see {@link https://github.com/expo/expo-server-sdk-node|expo-server-sdk-node}
 * @see {@link https://docs.expo.io/push-notifications/sending-notifications/|Expo Notifications}
 * @see {@link https://expo.io/notifications|Push notifications tool}
 *
 * @category Services
 * @module Expo
 */
import { Job } from 'pg-boss'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import PushToken from 'App/Models/PushToken'
import Subscription from 'App/Models/Subscription'
import Scheduler, { JobNames } from 'App/Services/Scheduler'
import { Expo, ExpoPushTicket, ExpoPushMessage } from 'expo-server-sdk'

// One hour timeout (specified in seconds)
const RECIEPT_FETCH_TIMEOUT = 60 * 60

export type NotificationRecieptsData = { [ticketId: string]: string }

class ExpoService {
    private expo?: Expo
    private testing = false
    private development = false
    private hasScheduleListener = false

    constructor() {
        this.testing = Env.get('NODE_ENV', 'development') === 'testing'
        this.development = Env.get('NODE_ENV', 'development') === 'development'
        const accessToken = Env.get('EXPO_ACCESS_TOKEN')

        if (!accessToken) {
            Logger.error('Expo SDK could not be initialized. "EXPO_ACCESS_TOKEN" is not set')
            return
        }

        this.expo = new Expo({ accessToken })
    }

    public setupScheduleListeners() {
        // Skip subscription if we already have it setup
        if (this.hasScheduleListener) {
            return
        }

        Scheduler.boss.subscribe(
            JobNames.NotificationReciepts,
            {},
            (job: Job<NotificationRecieptsData>) => this.validateReceipts(job)
        )

        this.hasScheduleListener = true
    }

    /**
     * Deletes the push token and all related subscriptions.
     * Note that this assumes that the push token has been preloaded.
     *
     * @param subscription - The subscription that caused a `DeviceNotRegistered` error
     */
    private async deletePushToken(subscription?: Subscription) {
        if (!subscription) {
            Logger.error(
                'Could not delete subscription for unregistered Expo push token. Subscription model is undefined'
            )
            return
        }

        // Save push token so taht we can delete later
        const pushToken = subscription.pushToken

        // Delete all subscriptions for this push token
        await Subscription.query().where('pushTokenId', subscription.pushToken.id).delete()
        await pushToken.delete()

        Logger.info(`Removed invalid push token: ${subscription.pushToken.token}`)
    }

    /**
     * Deletes a push token based on a string. This should be used when fetching receipts.
     * This will not schedule any jobs for validating receipts.
     *
     * @param subscription - The token that caused a `DeviceNotRegistered` error
     */
    private async deleteReceiptPushToken(jobName: string, token?: string) {
        if (!token) {
            Logger.error(`Job ${jobName}: Could not delete token. Token is undefined`)
            return
        }

        const pushToken = await PushToken.findBy('token', token)

        if (!pushToken) {
            Logger.error(`Job ${jobName}: Could not delete token. No such token in the database`)
            return
        }

        // Delete all subscriptions for this push token
        await Subscription.query().where('pushTokenId', pushToken.id).delete()
        await pushToken.delete()
    }

    private async validateReceipts(job: Job<NotificationRecieptsData>) {
        if (this.development) {
            Logger.info(`Running job: ${job.name} and data: ${JSON.stringify(job.data, null, 4)}`)
        }

        const data = job.data

        // Make sure that we have receipts to validate
        if (!data || Object.keys(data).length === 0) {
            Logger.info(`Job "${job.name}" was cancelled because no data was provided`)
            return
        }

        if (!this.expo) {
            Logger.info(`Job "${job.name}" was cancelled because expo has not been initialized`)
            return
        }

        const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(Object.keys(data))

        receiptIdChunks.forEach(async (chunk) => {
            try {
                // It complains about this.expo possibly being null. This should never be the case.
                // @ts-ignore
                const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk)

                // The receipts specify whether Apple or Google successfully received the
                // notification and information about an error, if one occurred.
                for (const receiptId in receipts) {
                    const receipt = receipts[receiptId]

                    if (receipt.status === 'error') {
                        const { details } = receipt

                        if (!details || !details.error) {
                            // The error codes are listed in the Expo documentation:
                            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                            // You must handle the errors appropriately.
                            continue
                        }

                        switch (details?.error) {
                            case 'MessageTooBig': /* fallthrough */
                            case 'MessageRateExceeded':
                                // TODO: What the fuck should we do about this?
                                break
                            case 'InvalidCredentials':
                                Logger.error(`Job ${job.name}: Invalid expo credentials`)
                                break
                            case 'DeviceNotRegistered':
                                this.deleteReceiptPushToken(job.name, data[receiptId])
                                break
                            default:
                                Logger.info(
                                    `Job ${job.name}: Invalid error message received from expo`
                                )
                        }
                    }
                }
            } catch (error) {
                Logger.error(`Job ${job.name}: Failed to fetch receipts for chunk`)
            }
        })
    }

    /**
     * Validates the response (ticket) of each sent notification.
     * If any ticket contains an error, this must be handled accordingly.
     * In some cases, the error will indicate that the Expo push token is invalid
     * and we must make sure to stop sending notifications to it.
     *
     * @see {@link https://docs.expo.io/push-notifications/sending-notifications/#individual-errors|Expo response errors}
     *
     * @param tickets - The tickets to validate
     * @param subscriptions - The subscriptions that created the tickets, in the same order
     */
    private validateTickets(tickets: Array<ExpoPushTicket>, subscriptions: Array<Subscription>) {
        const validateTicketIds: NotificationRecieptsData = {}

        tickets.forEach((ticket, index) => {
            if (ticket.status !== 'ok') {
                switch (ticket.details?.error) {
                    case 'MessageTooBig': /* fallthrough */
                    case 'MessageRateExceeded':
                        Logger.error(`Could not send push notification: ${ticket.details.error}`)
                        break
                    case 'InvalidCredentials':
                        Logger.error(
                            'Invalid Expo push credentials, Please re-generate your credentials and restart'
                        )
                        this.expo = undefined
                        break
                    case 'DeviceNotRegistered':
                        if (index >= subscriptions.length) {
                            Logger.error(
                                'Could not remove unregistered Expo push token. Ticket index is out-of-bounds for subscriptions'
                            )
                            return
                        }

                        // The tickets are received in the same order as the notifications were sent.
                        // I.e., the index of the current ticket is related to the subscription
                        // with the same index. We use this to find the correct push token to remove.
                        this.deletePushToken(subscriptions[index])
                        break
                }
            } else {
                // Save receipt ids and validate later when they have been delivered
                validateTicketIds[ticket.id] = subscriptions[index].pushToken.token
            }
        })

        // If we have tickets to validate
        if (Object.keys(validateTicketIds).length !== 0) {
            // Queue job for fetching receipts
            Scheduler.boss.publishAfter(
                JobNames.NotificationReciepts,
                validateTicketIds,
                {},
                RECIEPT_FETCH_TIMEOUT
            )
        }
    }

    /**
     * Validates the format of an Expo push token.
     * Note that this does not (and can not) verify if the
     * token is a valid token, just that it follows the correct format.
     *
     * @param token - The token to validate
     * @returns true if the token is of a valid format
     */
    public isValidToken(token: string): boolean {
        if (!this.expo) {
            Logger.error('Could not validate Expo push token. Expo SDK is not initialized')
            return false
        }

        // For some reason, Expo accepts tokens with empty brackets,
        // so we add that check ourselves.
        return token !== 'ExponentPushToken[]' && Expo.isExpoPushToken(token)
    }

    /**
     * Sends push notification to all clients that has subscribed to
     * the topic and nation. If no applicable subscriptions can be found,
     * no requests will be made.
     *
     * This will automatically handle the verification of notification
     * delivery and will delete any push tokens that are no longer available.
     *
     * You can specify any data defined in {@link ExpoPushMessage}, except
     * the 'to' property. This will be automatically added based on the
     * push tokens that is subscribed to the topic.
     *
     * @see {@link https://docs.expo.io/push-notifications/sending-notifications/#formats|ExpoPushMessage}
     *
     * @param nationId - The oid of the nation that triggered the event
     * @param subscriptionTopicId - The subscription topic id
     * @param message - The notification to send
     */
    public async notify(
        nationId: number,
        subscriptionTopicId: number,
        message: Omit<ExpoPushMessage, 'to'>
    ): Promise<void> {
        // We do not want to send notifications during testing
        if (this.testing) {
            Logger.info('Skipping notification sending during testing')
            return
        }

        if (!this.expo) {
            Logger.error('Could not send push notification. Expo SDK is not initialized')
            return
        }

        const messages: Array<ExpoPushMessage> = []
        const applicableSubscriptions = await Subscription.query()
            .where('subscriptionTopicId', subscriptionTopicId)
            .where('nationId', nationId)
            .preload('pushToken')

        // Skip sending of push notifications if there are no subscribers
        if (applicableSubscriptions.length === 0) {
            Logger.info('Skipped sending of push notification. No active subcriptions')
            return
        }

        applicableSubscriptions.forEach((subscription) => {
            // Create push notification message
            messages.push({
                ...message,
                to: subscription.pushToken.token,
            })
        })

        // Chunk push notifications to reduce number of needed requests to be
        // sent to Expo servers.
        const chunks = this.expo.chunkPushNotifications(messages)
        const tickets: Array<ExpoPushTicket> = []

        for (const chunk of chunks) {
            try {
                const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk)
                tickets.push(...ticketChunk)
            } catch (error) {
                Logger.error(error)
            }
        }

        Logger.info('Successfully sent ')

        // Validate the returned tickets and handle any errors
        this.validateTickets(tickets, applicableSubscriptions)
        this.setupScheduleListeners()
    }
}

/**
 * This makes our service a singleton
 */
export default new ExpoService()
