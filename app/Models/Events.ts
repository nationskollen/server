import { DateTime } from 'luxon'
import OpeningHour from 'App/Models/OpeningHour'
import { toAbsolutePath } from 'App/Utils/Serialize'
import { hasMany, HasMany, column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

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

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public occursAt: DateTime

    // Specified opening hour for the event
    @hasMany(() => OpeningHour, { serializeAs: 'opening_hours' })
    public openingHours: HasMany<typeof OpeningHour>
}
