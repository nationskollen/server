import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Location from 'App/Models/Location'
import Event from 'App/Models/Event'
import { toAbsolutePath } from 'App/Utils/Serialize'
import { hasMany, HasMany, column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

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

    @column({ serialize: toAbsolutePath })
    public iconImgSrc: string

    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    @column()
    public accentColor: string

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    @hasMany(() => User, { localKey: 'oid' })
    public staff: HasMany<typeof User>

    @hasMany(() => Location, { localKey: 'oid' })
    public locations: HasMany<typeof Location>

    @hasMany(() => Event, { localKey: 'oid' })
    public events: HasMany<typeof Event>

    // Create nation query builder with locations preloaded
    private static withPreloads() {
        return Nation.query().preload('locations')
    }

    // Fetch all nations with all locations preloaded
    public static async allWithLocations() {
        return this.withPreloads()
    }

    // Fetch single nation with all locations preloaded
    public static async withLocations(oid: number) {
        return this.withPreloads().where('oid', oid).first()
    }
}
