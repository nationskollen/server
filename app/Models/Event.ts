/**
 * A nation can have events in order to distribute information about something
 * specific, for instance lunch, gathering or something similar.
 *
 * An event is dependent on which {@link Nation | nation} it relates to but
 * wether it has a {@link Location | location} or not is optional.
 *
 * @category Model
 * @module Event
 */
import { column, scope, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Category from 'App/Models/Category'
import { Topics } from 'App/Utils/Subscriptions'
import Notification from 'App/Models/Notification'
import { toBoolean, toAbsolutePath, toISO } from 'App/Utils/Serialize'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'
import OrderableModel from 'App/Utils/OrderableModel'

export default class Event extends OrderableModel {
    /**
     * Ordering options to query at ascending order
     */
    public static inOrder = scope((query) => {
        query.orderBy('occurs_at', 'asc')
    })

    /**
     * The id for the event
     */
    @column({ isPrimary: true })
    public id: number

    /**
     * The nation id the event belongs to
     */
    @column()
    public nationId: number

    /**
     * The name of the event
     */
    @column()
    public name: string

    /**
     * The short description of the event
     */
    @column()
    public shortDescription: string

    /**
     * The long description of the event.
     * This will not be included by default in the response.
     */
    @column({ serializeAs: null })
    public longDescription: string

    /**
     * The location of the event
     */
    @column()
    public locationId: number

    /**
     * specify if the event is only for nation members
     */
    @column({ consume: toBoolean })
    public onlyMembers: boolean

    /**
     * specify if the event is only for students
     */
    @column({ consume: toBoolean })
    public onlyStudents: boolean

    /**
     * the id associated with the category model
     */
    @column({ serializeAs: null })
    public categoryId: number

    /**
     * The id related to a notification that is created alongside the event
     * @todo add this as a `serializeAs: null` when sure that things work. for
     * now it is present in the response in order to test that notifications
     * are created and such
     */
    @column()
    public notificationId: number

    /**
     * specify if the event has a category
     */
    @belongsTo(() => Category)
    public category: BelongsTo<typeof Category>

    /**
     * Icon image for the event to be displayed
     * This image can be used for instance as a pinpoint on a map or a more
     * compact view
     */
    // TODO: Depends on if we want to keep this or not, maybe have event
    // filtering in the mapview and display icon uploaded for currently ongoing
    // event
    @column({ serialize: toAbsolutePath })
    public iconImgSrc: string

    /**
     * Cover image for the event to be displayed
     */
    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    /**
     * At what date the event occurs at
     */
    @column.dateTime({ serialize: toISO })
    public occursAt: DateTime

    /**
     * At what date the event ends at
     */
    @column.dateTime({ serialize: toISO })
    public endsAt: DateTime

    /**
     * At what date the event was updated at
     */
    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    /**
     * At what date the event was created at
     */
    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    /**
     * Creates a new notification for the event model.
     */
    public async createNotification() {
        const topic = await SubscriptionTopic.findBy('name', Topics.Events)

        if (!topic) {
            return
        }

        // Creating this in the afterCreate hook resulted in weird behavior
        // So this will have to do for now
        const notification = await Notification.create({
            title: this.name,
            message: this.shortDescription,
            nationId: this.nationId,
            subscriptionTopicId: topic.id,
        })

        // Update model with notification id
        this.notificationId = notification.id
        await this.save()
    }
}
