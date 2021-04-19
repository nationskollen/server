/**
 * A nation can have events in order to distribute information about something
 * specific, for instance lunch, gathering or something similar.
 *
 * An event is dependent on which {@link Nation | nation} it relates to but wether it has a {@link Location | location} or not is optional.
 *
 * @module Event
 */
import { DateTime } from 'luxon'
import { toAbsolutePath, toISO } from 'App/Utils/Serialize'
import { column, BaseModel, scope } from '@ioc:Adonis/Lucid/Orm'

export default class Event extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public nationId: number

    @column()
    public name: string

    @column()
    public description: string

    @column()
    public locationId: number

    @column()
    public onlyMembers: boolean

    @column()
    public onlyStudents: boolean

    // TODO: Depends on if we want to keep this or not, maybe have event
    // filtering in the mapview and display icon uploaded for currently ongoing
    // event
    @column({ serialize: toAbsolutePath })
    public iconImgSrc: string

    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    @column.dateTime({ serialize: toISO })
    public occursAt: DateTime

    @column.dateTime({ serialize: toISO })
    public endsAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    public static beforeDate = scope((query, date: DateTime) => {
        query.where('occurs_at', '<', date.toISO())
    })

    public static afterDate = scope((query, date: DateTime) => {
        // NOTE: Simply filtering by '>' with 'date.toISO()' does not work.
        // No idea why this is, but I don't really care either.
        query.where('occurs_at', '>=', date.plus({ day: 1 }).toISO())
    })

    public static onDate = scope((query, date: DateTime) => {
        query.whereBetween('occurs_at', [
            date.set({ hour: 0, minute: 0 }).toISO(),
            date.set({ hour: 23, minute: 59 }).toISO(),
        ])
    })

    public static inOrder = scope((query) => {
        query.orderBy('occurs_at', 'asc')
    })
}
