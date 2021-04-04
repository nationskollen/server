import { DateTime } from 'luxon'
import { toBoolean } from 'App/Utils/Serialize'
import OpeningHour from 'App/Models/OpeningHour'
import { ActivityLevels, MAX_ACTIVITY_LEVEL } from 'App/Utils/Activity'
import { BaseModel, column, hasMany, HasMany, beforeUpdate } from '@ioc:Adonis/Lucid/Orm'

export default class Location extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public nationId: number

    @column()
    public name: string

    @column()
    public description: string

    @column()
    public address: string

    // Max people capacity of the location
    @column()
    public maxCapacity: number

    @column()
    public estimatedPeopleCount: number

    @column()
    public activityLevel: ActivityLevels

    // If the location is currently open
    // TODO: Consider not serializing this and instead calculate it on the frontend
    @column({ consume: toBoolean })
    public isOpen: boolean

    @column()
    public coverImgSrc: string

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    @hasMany(() => OpeningHour, { serializeAs: 'opening_hours' })
    public openingHours: HasMany<typeof OpeningHour>

    @hasMany(() => OpeningHour, { serializeAs: 'opening_hour_exceptions' })
    public openingHourExceptions: HasMany<typeof OpeningHour>

    // Dynamically update the activity level based on the estimated people count
    @beforeUpdate()
    public static async updateActivityLevel(location: Location) {
        // If the location is closed, there is no need to update the activity level
        if (!location.isOpen) {
            return
        }

        if (location.$dirty.hasOwnProperty('estimatedPeopleCount') || location.$dirty.maxCapacity) {
            const activityInPercentage = location.estimatedPeopleCount / location.maxCapacity
            const newActivityLevel = Math.round(activityInPercentage * MAX_ACTIVITY_LEVEL)

            // Clamp new activity level between ActivityLevels.Low and ActivityLevels.Full.
            // This code only runs if the location is open and therefore we should never set
            // the new activity level to ActivityLevels.Closed.
            location.activityLevel = Math.min(
                Math.max(newActivityLevel, ActivityLevels.Low),
                MAX_ACTIVITY_LEVEL
            )
        }
    }
}
