import OpeningHour from 'App/Models/OpeningHour'
import { DateTime } from 'luxon'
import { toAbsolutePath } from 'App/Utils/Serialize'
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

    @column({ serialize: toAbsolutePath })
    public iconImgSrc: string

    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ serialize: OpeningHour.toHour })
    public occursAt: DateTime

    @column.dateTime({ serialize: OpeningHour.toHour })
    public endAt: DateTime
}
