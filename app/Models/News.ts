import { DateTime } from 'luxon'
import { Topics } from 'App/Utils/Subscriptions'
import Notification from 'App/Models/Notification'
import { toAbsolutePath, toISO } from 'App/Utils/Serialize'
import { column } from '@ioc:Adonis/Lucid/Orm'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'
import OrderableModel from 'App/Utils/OrderableModel'

export default class News extends OrderableModel {
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

    // I think that adonijs creates ISO dates for the regular
    // created_at and updated_at fields without the need of
    // serializing them in the model. Though, just in case ive
    // serialized them as `toIso`
    @column.dateTime({
        autoCreate: true,
        serialize: toISO,
    })
    public createdAt: DateTime

    @column.dateTime({
        autoCreate: true,
        autoUpdate: true,
        serialize: toISO,
    })
    public updatedAt: DateTime

    /**
     * Creates a new notification for the news model.
     */
    public async createNotification() {
        const topic = await SubscriptionTopic.findBy('name', Topics.News)

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
