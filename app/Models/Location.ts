import Ws from 'App/Services/Ws'
import { DateTime } from 'luxon'
import Menu from 'App/Models/Menu'
import OpeningHour from 'App/Models/OpeningHour'
import { toBoolean, toAbsolutePath } from 'App/Utils/Serialize'
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

    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    @hasMany(() => OpeningHour, { serializeAs: 'opening_hours' })
    public openingHours: HasMany<typeof OpeningHour>

    @hasMany(() => OpeningHour, { serializeAs: 'opening_hour_exceptions' })
    public openingHourExceptions: HasMany<typeof OpeningHour>

    @hasMany(() => Menu, { serializeAs: 'menus' })
    public menus: HasMany<typeof Menu>

    // Dynamically update the activity level based on the estimated people count
    @beforeUpdate()
    public static async updateActivityLevel(location: Location) {
        if (
            !location.$dirty.hasOwnProperty('isOpen') &&
            !location.$dirty.hasOwnProperty('maxCapacity') &&
            !location.$dirty.hasOwnProperty('estimatedPeopleCount')
        ) {
            // No activity changes has been made
            return
        }

        // If the location is open and 'estimatedPeopleCount' or 'maxCapacity'
        // has changed.
        const activityInPercentage = location.estimatedPeopleCount / location.maxCapacity
        let newActivityLevel = Math.round(activityInPercentage * MAX_ACTIVITY_LEVEL)

        // Make sure that the activity can not be set to closed if the location is open
        if (location.isOpen && newActivityLevel === ActivityLevels.Closed) {
            newActivityLevel = ActivityLevels.Low
        }

        // Skip activity broadcast if the activity level is the same
        // NOTE: This must be checked after we set the activity level
        //       to ActivityLevels.Low if open. Otherwise, it might
        //       return when in fact the activity level is one higher.
        if (newActivityLevel === location.activityLevel) {
            return
        }

        location.activityLevel = newActivityLevel

        // Broadcast new activity to all connected websocket clients
        Ws.broadcastActivity(location.nationId, location.id, location.activityLevel)
    }

    // Set location state to open
    public async setOpen() {
        this.isOpen = true
        this.estimatedPeopleCount = 0
        await this.save()

        return this
    }

    // Set location state to closed
    public async setClosed() {
        this.isOpen = false
        this.estimatedPeopleCount = 0
        await this.save()

        return this
    }

    // Create location query builder with opening hours preloaded
    public static withPreloads() {
        return this.query()
            .preload('openingHours', (query) => {
                query.apply((scopes) => scopes.default())
            })
            .preload('openingHourExceptions', (query) => {
                query.apply((scopes) => scopes.exception())
            })
    }

    // Fetch all locations with all opening hours preloaded
    public static async allWithOpeningHours() {
        return this.withPreloads()
    }

    // Fetch single location with all opening hours preloaded
    public static async withOpeningHours(lid: number) {
        return this.withPreloads().where('id', lid).first()
    }
}
