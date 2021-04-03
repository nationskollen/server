import { DateTime } from 'luxon'
import { Days, OpeningHourTypes } from 'App/Utils/Time'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import {
    fromStringToOpeningHour,
    fromIsoToOpeningHour,
    fromIntegerToBoolean,
    fromIsoToSpecialDate,
    fromStringToSpecialDate,
} from 'App/Utils/Serialize'

export default class OpeningHour extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column({ serializeAs: 'oid' })
    public nationId: number

    @column()
    public type: OpeningHourTypes

    @column()
    public day: Days

    @column()
    public daySpecial: string

    @column.dateTime({
        prepare: fromIsoToSpecialDate,
        consume: fromStringToSpecialDate,
        serialize: fromStringToSpecialDate,
    })
    public daySpecialDate: DateTime

    @column.dateTime({
        prepare: fromIsoToOpeningHour,
        consume: fromStringToOpeningHour,
        serialize: fromStringToOpeningHour,
    })
    public open: DateTime

    @column.dateTime({
        prepare: fromIsoToOpeningHour,
        consume: fromStringToOpeningHour,
        serialize: fromStringToOpeningHour,
    })
    public close: DateTime

    @column({ consume: fromIntegerToBoolean })
    public isOpen: boolean

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime
}
