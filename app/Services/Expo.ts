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
import { Expo, ExpoPushTicket, ExpoPushMessage } from 'expo-server-sdk'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import Subscription from 'App/Models/Subscription'

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

                // TODO: Handle ticket error
                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                tickets.push(...ticketChunk)
            } catch (error) {
                Logger.error(error)
            }
        }
    }
}

/**
 * This makes our service a singleton
 */
export default new ExpoService()
