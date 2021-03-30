import { hasOne, HasOne, column, BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import User from 'App/Models/User'

export enum ActivityLevel {
    Closed,
    Low,
    Medium,
    High,
}

export type HexColor = string
export type ImageSrc = string

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

    // The id of the admin user (foreign key)
    @column({ serializeAs: null })
    public adminUserId: number

    // Full student nation name, e.g. Västmanlands-Dala nation
    @column()
    public name: string

    // Short student nation name, e.g. V-dala
    @column()
    public shortName: string

    @column()
    public description: string

    @column()
    public address: string

    // Max people capacity of their restaurant, club, etc.
    // TODO: Should we allow multiple locations?
    @column()
    public maxCapacity: number

    @column()
    public estimatedPeopleCount: number

    @column()
    public activityLevel: ActivityLevel

    @column()
    public iconImgSrc: ImageSrc

    @column()
    public coverImgSrc: ImageSrc

    @column()
    public accentColor: HexColor

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    // A nation can only have a single admin user
    @hasOne(() => Nation, { foreignKey: 'adminUserId' })
    public owner: HasOne<typeof Nation>
}
