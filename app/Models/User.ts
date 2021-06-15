/**
 * A user at nationskollen is only existing in order to perform actions on the
 * database and handle data. The user might want to upload a new {@link Event},
 * {@link Location} or {@link MenuItem} etc. Doing so is done by the different
 * `CRUD` operations that are provided in the `Controller` modules that are
 * found at the start page of the docs.
 *
 * A user is part of the {@link NationOwnerScopes | Scopes} that either characterize a user with
 * different amount of priviliges in the system.
 *
 * @category Model
 * @module User
 */
import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { toBoolean, toAbsolutePath } from 'App/Utils/Serialize'
import { BaseModel, column, beforeSave, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Permission from 'App/Models/Permission'

export default class User extends BaseModel {
    /**
     * The id for the user
     */
    @column({ isPrimary: true })
    public id: number

    @column()
    public fullName: string

    /**
     * The email for the user
     */
    @column()
    public email: string

    /**
     * The password for the user
     */
    @column({ serializeAs: null })
    public password: string

    /**
     * The nation that this user is a part of
     */
    @column({ serializeAs: 'oid' })
    public nationId: number

    /**
     * If the user is a nation admin
     */
    @column({ consume: toBoolean })
    public nationAdmin: boolean

    /**
     * Not used at the moment!
     */
    @column()
    public rememberMeToken?: string

    /**
     * The date the user was created on
     */
    @column.dateTime({
        autoCreate: true,
    })
    public createdAt: DateTime

    /**
     * The date the user was updated on
     */
    @column.dateTime({
        autoCreate: true,
        autoUpdate: true,
    })
    public updatedAt: DateTime

    /**
     * The different permissions a user has in the system
     */
    @hasMany(() => Permission)
    public permissions: HasMany<typeof Permission>

    /**
     * Avatar image for the user to be displayed
     */
    @column({ serialize: toAbsolutePath })
    public avatarImgSrc: string

    /**
     * Method that hashes passwords for a user
     * @param user
     * Takes in a user model and extracts the password that is assigned for the
     * user
     */
    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password)
        }
    }
}
