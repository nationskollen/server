import { DateTime } from 'luxon'
import { Topics } from 'App/Utils/Subscriptions'
import Notification from 'App/Models/Notification'
import { toAbsolutePath } from 'App/Utils/Serialize'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'

export default class News extends BaseModel {
    /**
     * Filtering options to query news before specified date
     */
    public static beforeDate = scope((query, date: DateTime) => {
        query.where('updated_at', '<', date.toISO())
    })

    /**
     * Filtering options to query news after specified date
     */
    public static afterDate = scope((query, date: DateTime) => {
        /**
         * NOTE: Simply filtering by '>' with 'date.toISO()' does not work.
         * No idea why this is, but I don't really care either.
         */
        query.where('updated_at', '>=', date.plus({ day: 1 }).toISO())
    })

    /**
     * Filtering options to query news at specified date
     */
    public static onDate = scope((query, date: DateTime) => {
        query.whereBetween('updated_at', [
            date.set({ hour: 0, minute: 0 }).toISO(),
            date.set({ hour: 23, minute: 59 }).toISO(),
        ])
    })

    /**
     * Ordering options to query events at ascending order
     */
    public static inOrder = scope((query) => {
        query.orderBy('created_at', 'desc')
    })

    /**
     * Id to identify the news object
     */
    @column({ isPrimary: true })
    public id: number

    /**
     * nationId that the news object belongs to
     */
    @column()
    public nationId: number

    /**
     * notificationId that the news has
     */
    @column()
    public notificationId: number

    /**
     * The title or name that the news has
     */
    @column()
    public title: string

    /**
     * The shortDescription or name that the news has that can be used for
     * comapct description
     */
    @column()
    public shortDescription: string

    /**
     * The longDescription or name that the news has that can be used for
     * a more freely used description
     */
    @column()
    public longDescription: string

    /**
     * Cover image for the event to be displayed
     */
    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    /**
     * Creates a new notification for the news model.
     */
    public async createNotification() {
        const topic = await SubscriptionTopic.findBy('name', Topics.Events)

        if (!topic) {
            return
        }

        // Creating this in the afterCreate hook resulted in weird behavior
        const notification = await Notification.create({
            title: this.title,
            message: this.shortDescription,
            nationId: this.nationId,
            subscriptionTopicId: topic.id,
        })

        // Update model with notification id
        this.notificationId = notification.id
        await this.save()
    }
}
