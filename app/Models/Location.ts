/**
 *
 * The location model specifies how a nation can have a location with different
 * properties.  For instance,  a nation does not only want to show that it has
 * a nation building, but maybe show that it also has a location for having
 * lunch for instance.
 *
 * One important thing is that the activity level is operated upon each
 * location that a nation specifies to use. The activity level updates
 * dynamically by reading from what estimation of people there are (though a
 * counter accessed by a staff/admin in the admin interface) and the max
 * capacity that is set on the location
 *
 * For e.g:
 *
 * ```json
 * // max_capacity is 200
 * // estimated_people_count for this example is 100
 * // activity level is 0.5 => Medium (+- High, Low)
 *
 *  {
 *  	"change": 80
 *  }
 *
 * // estimated_people_count becomes 180
 * // activity rises up to VeryHigh
 * //
 * ```
 *
 * @category Model
 * @module Location
 */

import Ws from 'App/Services/Ws'
import { DateTime } from 'luxon'
import Menu from 'App/Models/Menu'
import OpeningHour from 'App/Models/OpeningHour'
import { toBoolean, toAbsolutePath } from 'App/Utils/Serialize'
import { ActivityLevels, MAX_ACTIVITY_LEVEL } from 'App/Utils/Activity'
import { BaseModel, column, hasMany, HasMany, beforeUpdate } from '@ioc:Adonis/Lucid/Orm'

export default class Location extends BaseModel {
    /**
     * The Id of the location
     */
    @column({ isPrimary: true })
    public id: number

    /**
     * The id of the nation the location belongs to
     */
    @column()
    public nationId: number

    /**
     * The name of the location
     */
    @column()
    public name: string

    /**
     * The description of the location
     */
    @column()
    public description: string

    /**
     * The address of the location
     */
    @column()
    public address: string

    /**
     * Wether to display the location on the map or not
     */
    @column({ consume: toBoolean })
    public showOnMap: boolean

    /**
     * Latitude coordinates for the location
     */
    @column()
    public latitude: number

    /**
     * Longitude coordinates for the location
     */
    @column()
    public longitude: number

    /**
     * Max people capacity of the location
     */
    @column()
    public maxCapacity: number

    /**
     * Estimated people at the location
     */
    @column()
    public estimatedPeopleCount: number

    /**
     * The {@link ActivityLevels | activity level } at the location,
     * dynamically changed depending on
     * {@link estimatedPeopleCount} and {@link maxCapacity}
     */
    @column()
    public activityLevel: ActivityLevels

    @column({ consume: toBoolean })
    public activityLevelDisabled: boolean

    /**
     * The assigned default location for nation (parent model)
     */
    @column({ consume: toBoolean })
    public isDefault: boolean

    /**
     * If the location is currently open or not
     */
    @column({ consume: toBoolean })
    public isOpen: boolean

    /**
     * The cover image for the location to be displayed
     */
    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    /**
     * The date the location was created
     */
    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    /**
     * The date the location was updated
     */
    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    /**
     * The {@link openingHours | opening hours} that are used at a given
     * location, there can be multiple opening hours
     */
    @hasMany(() => OpeningHour, {
        serializeAs: 'opening_hours',
        onQuery: (query) => query.orderBy('day', 'asc'),
    })
    public openingHours: HasMany<typeof OpeningHour>

    /**
     * The {@link openingHours | opening hours exceptions} that are used at a given
     * location, there can be multiple opening hours exceptions
     */
    @hasMany(() => OpeningHour, { serializeAs: 'opening_hour_exceptions' })
    public openingHourExceptions: HasMany<typeof OpeningHour>

    /**
     * The {@link Menu | menus} that are used at a given
     * location, there can be multiple menus
     */
    @hasMany(() => Menu, { serializeAs: 'menus' })
    public menus: HasMany<typeof Menu>

    /**
     * The method that dynamically update the activity level based on the
     * estimated people count
     *
     * @param location - The location to update its {@link ActivityLevels |
     * activity level}
     */
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

    /**
     * Set location state to open
     */
    public async setOpen() {
        this.isOpen = true
        this.estimatedPeopleCount = 0
        await this.save()

        return this
    }

    /**
     * Set location state to closed
     */
    public async setClosed() {
        this.isOpen = false
        this.estimatedPeopleCount = 0
        await this.save()

        return this
    }

    /**
     * Create location query builder with opening hours preloaded
     */
    public static withPreloads() {
        return this.query()
            .preload('openingHours', (query) => {
                query.apply((scopes) => scopes.default())
            })
            .preload('openingHourExceptions', (query) => {
                query.apply((scopes) => scopes.exception())
            })
    }

    /**
     * Fetch all locations with all opening hours preloaded
     */
    public static async allWithOpeningHours() {
        return this.withPreloads()
    }

    /**
     * Fetch single location with all opening hours preloaded
     * @param lid - The id of the location
     */
    public static async withOpeningHours(lid: number) {
        return this.withPreloads().where('id', lid).first()
    }

    /**
     * Sets the previous location that was the default location for the nationback to false.
     * It can only be initiated when a new default is proposed
     */
    public static async setNotDefault(oid: number) {
        const previousDefault = await Location.query()
            .where('isDefault', true)
            .where('nationId', oid)
            .first()
        if (previousDefault) {
            previousDefault.isDefault = false
            await previousDefault.save()
        }
    }
}
