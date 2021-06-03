import { DateTime } from 'luxon'
import { Topics } from 'App/Utils/Subscriptions'
import Notification from 'App/Models/Notification'
import { toAbsolutePath } from 'App/Utils/Serialize'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'

export default class News extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public nationId: number

    @column()
    public notificationId: number

    @column()
    public title: string

    @column()
    public shortDescription: string

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
