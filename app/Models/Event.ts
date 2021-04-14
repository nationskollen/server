import { DateTime } from 'luxon'
import { toAbsolutePath, toHour } from 'App/Utils/Serialize'
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class Event extends BaseModel {
    @column({ isPrimary: true, serializeAs: null })
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

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ serialize: toHour })
    public occursAt: DateTime

    @column.dateTime({ serialize: toHour })
    public endsAt: DateTime
}
