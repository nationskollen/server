/**
 * The model for the implementation hours where you would find all the
 * fields that `OpeningHour` object (model) would be built up with.
 *
 * There are two different types of opening hours:
 * - `0` - Default - Regular opening hour on e.g. Monday
 * - `1` - Exception - Holidays, etc.
 *
 * Within these two types of opening hours, we can specify the days and such
 * with the help of using the enum type {@link Days}
 * and the {@link OpeningHourTypes}.
 *
 * @category Model
 * @module OpeningHour
 */

import { DateTime } from 'luxon'
import { toBoolean, toHour } from 'App/Utils/Serialize'
import { Days, OpeningHourTypes } from 'App/Utils/Time'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'

/**
 * Here begins the model for opening hours
 * @class OpeningHour
 */
export default class OpeningHour extends BaseModel {
    public static default = scope((query) => {
        query.where('type', OpeningHourTypes.Default)
    })

    public static exception = scope((query) => {
        query.where('type', OpeningHourTypes.Exception)
    })

    /**
     * Method that transforms `DateTime`
     * @param value value to be reformatted to desired format
     * @returns value in format `d/M`
     */
    public static toDate(value: DateTime) {
        return value ? value.toFormat('d/M') : value
    }

    /**
     * Id for opening hours model
     */
    @column({ isPrimary: true })
    public id: number

    /**
     * Id for which location the opening hours belong to
     */
    @column()
    public locationId: number

    /**
     * The type of opening hour, depending if its an exception day etc
     */
    @column()
    public type: OpeningHourTypes

    /**
     * Which day that is found the {@link Days}
     */
    @column()
    public day: Days

    /**
     * Specify if there is a special day
     */
    @column()
    public daySpecial: string

    /**
     * Which date this special day occurs at
     */
    @column.dateTime({ serialize: OpeningHour.toDate })
    public daySpecialDate: DateTime

    /**
     * Which hour its set to open (format HH:MM)
     */
    @column.dateTime({ serialize: toHour })
    public open: DateTime

    /**
     * Which hour its set to close (format HH:MM)
     */
    @column.dateTime({ serialize: toHour })
    public close: DateTime

    /**
     * Check for wether it is open or not
     */
    @column({ serialize: toBoolean })
    public isOpen: boolean

    /**
     * At which date the opening hour was created at
     */
    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    /**
     * At which date the opening hour was updated at
     */
    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime
}
