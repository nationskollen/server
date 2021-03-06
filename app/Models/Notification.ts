import { DateTime } from 'luxon'
import ExpoService from 'App/Services/Expo'
import { BaseModel, column, scope, afterCreate } from '@ioc:Adonis/Lucid/Orm'

export default class Notification extends BaseModel {
    /**
     * Filtering options to query notifications after specified date
     */
    public static afterDate = scope((query, date: DateTime) => {
        /**
         * NOTE: Simply filtering by '>' with 'date.toISO()' does not work.
         * No idea why this is, but I don't really care either.
         */
        query.where('created_at', '>=', date.toISO())
    })

    /**
     * Ordering options to query notifications at ascending order
     */
    public static inOrder = scope((query) => {
        query.orderBy('created_at', 'desc')
    })

    /**
     * Id to identify the notification
     */
    @column({ isPrimary: true })
    public id: number

    /**
     * nation that the notification object belongs to
     */
    @column()
    public nationId: number

    /**
     * Subscription topic that the notification belongs to
     */
    @column()
    public subscriptionTopicId: number

    /**
     * The title or name that the notification has
     */
    @column()
    public title: string

    /**
     * The message that the notification has
     */
    @column()
    public message: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    /**
     * Queues a job for sending out the push notifications
     */
    @afterCreate()
    public static async queuePushNotification(notification: Notification) {
        ExpoService.notify(notification.nationId, notification.subscriptionTopicId, {
            title: notification.title,
            body: notification.message,
        })
    }
}
