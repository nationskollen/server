import { DateTime } from 'luxon'
import { Days } from 'App/Utils/Time'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

// TODO: Add column for the day as a string, e.g. Christmas
// TODO: Add column for the type, e.g. default, exception
export default class OpeningHour extends BaseModel {
    @column({ isPrimary: true, serializeAs: null })
    public id: number

    @column({ serializeAs: 'oid' })
    public nationId: number

    @column()
    public day: Days

    @column()
    public open: string

    @column()
    public close: string

    @column()
    public isOpen: boolean

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}