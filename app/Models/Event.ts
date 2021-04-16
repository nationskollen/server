import { DateTime } from 'luxon'
import { toAbsolutePath, toISO } from 'App/Utils/Serialize'
import { column, BaseModel, scope } from '@ioc:Adonis/Lucid/Orm'

export default class Event extends BaseModel {
    public static beforeDate = scope((query, date?: DateTime) => {
        if (!date) {
            return
        }

        query.where('occurs_at', '<=', date.toSQLDate())
    })

    public static afterDate = scope((query, date?: DateTime) => {
        if (!date) {
            return
        }

        query.where('occurs_at', '>=', date.toSQLDate())
    })

    public static onDate = scope((query, date?: DateTime) => {
        if (!date) {
            return
        }

        query.where('occurs_at', '=', date.toSQLDate())
    })

    public static inOrder = scope((query) => {
        query.where('occurs_at', 'asc')
    })

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
}
