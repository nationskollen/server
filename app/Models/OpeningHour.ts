import { DateTime } from 'luxon'
import { toBoolean } from 'App/Utils/Serialize'
import { Days, OpeningHourTypes } from 'App/Utils/Time'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'

export default class OpeningHour extends BaseModel {
    public static default = scope((query) => {
        query.where('type', OpeningHourTypes.Default)
    })

    public static exception = scope((query) => {
        query.where('type', OpeningHourTypes.Exception)
    })

    public static toDate(value: DateTime) {
        return value ? value.toFormat('d/M') : value
    }

    public static toHour(value: DateTime) {
        return value ? value.toFormat('HH:mm') : value
    }

    @column({ isPrimary: true })
    public id: number

    @column()
    public locationId: number

    @column()
    public type: OpeningHourTypes

    @column()
    public day: Days

    @column()
    public daySpecial: string

    @column.dateTime({ serialize: OpeningHour.toDate })
    public daySpecialDate: DateTime

    @column.dateTime({ serialize: OpeningHour.toHour })
    public open: DateTime

    @column.dateTime({ serialize: OpeningHour.toHour })
    public close: DateTime

    @column({ serialize: toBoolean })
    public isOpen: boolean

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime
}
