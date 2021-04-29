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
import { DateTime } from 'luxon'
import { toAbsolutePath, toISO } from 'App/Utils/Serialize'
import {
    column,
    BaseModel,
    scope,
    belongsTo,
    BelongsTo,
    beforeCreate,
    beforeDelete,
} from '@ioc:Adonis/Lucid/Orm'
import Notification from 'App/Models/Notification'
import Category from 'App/Models/Category'

export default class Event extends BaseModel {
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
    @column()
    public onlyMembers: boolean

    /**
     * specify if the event is only for students
     */
    @column()
    public onlyStudents: boolean

    /**
     * the id associated with the category model
     */
    @column({ serializeAs: null })
    public categoryId: number

    /**
     * The id related to a notification that is created alongside the event
     */
    @column({ serializeAs: null })
    private notificationId: number

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
     * creates a notification when a new event is created. It also saves the
     * notification associated with the event in a model field
     * @param event the event that is created
     */
    @beforeCreate()
    public static async createNotification(event: Event) {
        let notification = await Notification.create({
            title: event.name,
            message: event.shortDescription,
        })

        event.notificationId = notification.id
    }

    /**
     * removes a notification when a an event is deleted by reading the saved
     * notificationId
     * @param event the event that is to be deleted
     */
    @beforeDelete()
    public static async removeNotification(event: Event) {
        const notification = await Notification.findByOrFail('id', event.notificationId)
        await notification.delete()
    }

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
}
