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
import { column, BaseModel, scope, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Category from 'App/Models/Category'
import { Topics } from 'App/Utils/Subscriptions'
import Notification from 'App/Models/Notification'
import { toBoolean, toAbsolutePath, toISO } from 'App/Utils/Serialize'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'

export default class Event extends BaseModel {
    /**
     * Filtering options to query events before specified date
     */
    public static beforeDate = scope((query, date: DateTime) => {
        query.where('occurs_at', '<', date.toISO())
    })

    /**
     * Filtering options to query events after specified date
     */
    public static afterDate = scope((query, date: DateTime) => {
        /**
         * NOTE: Simply filtering by '>' with 'date.toISO()' does not work.
         * No idea why this is, but I don't really care either.
         */
        query.where('occurs_at', '>=', date.plus({ day: 1 }).toISO())
    })

    /**
     * Filtering options to query events at specified date
     */
    public static onDate = scope((query, date: DateTime) => {
        query.whereBetween('occurs_at', [
            date.set({ hour: 0, minute: 0 }).toISO(),
            date.set({ hour: 23, minute: 59 }).toISO(),
        ])
    })

    /**
     * Ordering options to query events at ascending order
     */
    public static inOrder = scope((query) => {
        query.orderBy('occurs_at', 'asc')
    })

    /**
     * filtering options to query events for their categoryId
     * @param categoryId the number for the id to query for
     */
    public static perCategory = scope((query, categoryId: number) => {
        query.where('categoryId', categoryId)
    })

    /**
     * filtering options to query events for their oid belonging
     * @param categoryId the number for the id to query for
     */
    public static filterOutOids = scope((query, oids?: Array<number>) => {
        if (oids) {
            query.whereNotIn('nationId', oids)
        }
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

    /**
     * filtering options to query events for members only
     * @param value the boolean for the wether the query is for members or not
     */
    public static forMembers = scope((query, value: boolean) => {
        query.where('onlyMembers', value)
    })

    /**
     * filtering options to query events for students only
     * @param value the boolean for the wether the query is for students or not
     */
    public static forStudents = scope((query, value: boolean) => {
        query.where('onlyStudents', value)
    })

    /**
     * filtering options to exclude events for their category that they belong to
     * @param categoryId the number for the id to query for
     */
    public static filterOutCategories = scope((query, categories?: Array<number>) => {
        if (categories) {
            query.whereNotIn('categoryId', categories)
        }
    })
}
