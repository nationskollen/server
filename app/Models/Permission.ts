/**
 * The model that defines a permission in the system.
 * Uses a sub-model for specifying the permission type of this model.
 * This (Permission) model is applicable onto {@link User | users} in the system.
 *
 * @category Model
 * @module Permission
 *
 */
import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
// import User from 'App/Models/User'
import PermissionType from 'App/Models/PermissionType'

export default class Permission extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    // @column()
    // public userId: number

    @column()
    public permissionTypeId: number

    /**
     * The permission type the permission model is belongs to
     */
    @hasOne(() => PermissionType)
    public permissionType: HasOne<typeof PermissionType>

    // @hasMany(() => User)
    // public users: HasMany<typeof User>

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime
}
