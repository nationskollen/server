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
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import Subscription from 'App/Models/Subscription'
import { Expo, ExpoPushTicket, ExpoPushMessage } from 'expo-server-sdk'

class ExpoService {
    private expo?: Expo
    private testing = false

    constructor() {
        this.testing = Env.get('NODE_ENV', 'development') === 'testing'
        const accessToken = Env.get('EXPO_ACCESS_TOKEN')

        if (!accessToken) {
            Logger.error('Expo SDK could not be initialized. "EXPO_ACCESS_TOKEN" is not set')
            return
        }

        this.expo = new Expo({ accessToken })
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
                // TODO: Save receipt ids and validate later when they have been delivered
                // TODO: Queue job and fetch recipts after about an hour
                // TODO: Save recipts ids?
            }
        })
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
    }
}

/**
 * This makes our service a singleton
 */
export default new ExpoService()
