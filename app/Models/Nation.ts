import { DateTime } from 'luxon'
import User from 'App/Models/User'
import OpeningHour from 'App/Models/OpeningHour'
import { MAX_ACTIVITY_LEVEL, ActivityLevels } from 'App/Utils/Activity'
import { hasMany, HasMany, column, BaseModel, beforeUpdate } from '@ioc:Adonis/Lucid/Orm'

export default class Nation extends BaseModel {
    @column({ isPrimary: true, serializeAs: null })
    public id: number

    // Unique id for every student nation.
    // I believe this id is the same one that is used
    // by Studentkortet, etc.
    //
    // This id can be seen on nationsguiden.se by navigating
    // to a specific student nation, e.g:
    // https://nationsguiden.se/nation/?oid=400 for V-dala.
    @column()
    public oid: number

    // Full student nation name, e.g. Västmanlands-Dala nation
    @column()
    public name: string

    // Short student nation name, e.g. V-dala
    @column()
    public shortName: string

    @column()
    public description: string

    // If the nation is open for the day or not
    @column({ consume: (value: number) => Boolean(value) })
    public isOpen: boolean

    @column()
    public address: string

    // Max people capacity of their restaurant, club, etc.
    // TODO: Should we allow multiple locations?
    @column()
    public maxCapacity: number

    @column()
    public estimatedPeopleCount: number

    @column()
    public activityLevel: ActivityLevels

    @column()
    public iconImgSrc: string

    @column()
    public coverImgSrc: string

    @column()
    public accentColor: string

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    // A nation can have many staff users
    @hasMany(() => User, { localKey: 'oid' })
    public staff: HasMany<typeof User>

    // A nation can have many opening hours
    @hasMany(() => OpeningHour, { localKey: 'oid' })
    public openingHours: HasMany<typeof OpeningHour>

    // TODO: Not sure how to handle these
    // There are exceptions to opening hours, e.g. christmas
    @hasMany(() => OpeningHour, { localKey: 'oid' })
    public openingHourExceptions: HasMany<typeof OpeningHour>

    // Dynamically update the activity level based on the estimated people count
    @beforeUpdate()
    public static async updateActivityLevel(nation: Nation) {
        if (!nation.isOpen) {
            return
        }

        if (nation.$dirty.hasOwnProperty('estimatedPeopleCount') || nation.$dirty.maxCapacity) {
            const activityInPercentage = nation.estimatedPeopleCount / nation.maxCapacity
            const newActivityLevel = Math.round(activityInPercentage * MAX_ACTIVITY_LEVEL)

            nation.activityLevel = Math.min(Math.max(newActivityLevel, 0), MAX_ACTIVITY_LEVEL)

            // TODO OPENING HOURS CHECK
            if (nation.activityLevel === 0) {
                nation.activityLevel = 1
            }
        }
    }
}
