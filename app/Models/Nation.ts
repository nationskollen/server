/**
 * A nation is the organizational model that holds all other models inside it.
 * The server has 13 nation models.
 *
 * The nation model can only be created/updated by a {@link NationOwnerScopes
 * |nation admin}. Whereas staff that is part of  nation will only have the
 * ability to configure parts such as the location activity levels.
 *
 *
 * A nation model is built up with the following structure:
 *
 * ```json
 *
 * {
 * # GET /api/v1/nations/400
 *
 *    "oid": 400,
 *    "name": "Västmanlands-Dala nation",
 *    "short_name": "V-dala",
 *    "description": "Eius sint beatae id quos.",
 *    "icon_img_src": null,
 *    "cover_img_src": null,
 *    "accent_color": "#0053a4"
 * }
 * ```
 *
 * As shown above, the locations for the nation are not in the response.
 * Though they can be accessed through different `CRUD` operation such as;
 * ```json
 * GET /api/v1/nations/400/locations
 * ```
 *
 * See {@link Location} for more info about locations.
 *
 * The same goes for the events for a nation, accessed through similar `CRUD`
 * operation(s). See {@link Event} for more info.
 *
 * @category Model
 * @module Nation
 *
 *
 */

import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Location from 'App/Models/Location'
import Event from 'App/Models/Event'
import { toAbsolutePath } from 'App/Utils/Serialize'
import { hasOne, hasMany, HasOne, HasMany, column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

/**
 * Nation class with all its attributes and methods
 */
export default class Nation extends BaseModel {
    @column({ isPrimary: true, serializeAs: null })
    public id: number

    /**
     * Unique id for every student nation.
     *
     * > This id for a similar system can be seen on nationsguiden.se by
     *   navigating to a specific student nation, e.g:
     *   https://nationsguiden.se/nation/?oid=400 for V-dala.
     */
    @column()
    public oid: number

    /**
     * Full student nation name, e.g. Västmanlands-Dala nation
     */
    @column()
    public name: string

    /**
     * Short student nation name, e.g. V-dala
     */
    @column()
    public shortName: string

    /**
     * student nation description
     */
    @column()
    public description: string

    /**
     * student nation icon image that is used in the system for different components.
     * for e.g: Notifications etc
     */
    @column({ serialize: toAbsolutePath })
    public iconImgSrc: string

    /**
     * student nation pin image that is used in the system for different components.
     * for e.g: Map pin, Notifications etc
     */
    @column({ serialize: toAbsolutePath })
    public pinImgSrc: string

    /**
     * student nation cover image that is used at nation page to display
     */
    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    /**
     * student nation accent color that is used to give character to the
     * specific model. Used in the frontend.
     */
    @column()
    public accentColor: string

    /**
     * The date the nation was created at
     */
    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    /**
     * The date the nation was updated at
     */
    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    /**
     * The different locations related to the nation
     */
    @hasOne(() => Location, {
        localKey: 'oid',
        onQuery: (query) => query.where('isDefault', true),
        serializeAs: 'default_location',
    })
    public defaultLocation: HasOne<typeof Location>

    /**
     * The different staff users in the nation
     */
    @hasMany(() => User, { localKey: 'oid' })
    public staff: HasMany<typeof User>

    /**
     * The different locations related to the nation
     */
    @hasMany(() => Location, { localKey: 'oid' })
    public locations: HasMany<typeof Location>

    /**
     * The different events related to the nation
     */
    @hasMany(() => Event, { localKey: 'oid' })
    public events: HasMany<typeof Event>

    /**
     * Create nation query builder with locations preloaded
     */
    private static withPreloads() {
        return Nation.query().preload('locations')
    }

    /**
     * Fetch all nations with all locations preloaded
     */
    public static async allWithLocations() {
        return this.withPreloads()
    }

    /**
     * Fetch single nation with all locations preloaded
     */
    public static async withLocations(oid: number) {
        return this.withPreloads().where('oid', oid).first()
    }
}
