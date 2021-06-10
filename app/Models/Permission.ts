/**
 * @category Model
 * @module Permission
 */
import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import PermissionType from 'App/Models/PermissionType'

export default class Permission extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    /**
     * The type that the permission belongs to.
     * Since each user gets assigned to a permission model, this field will
     * tell which type it belongs to.
     */
    @hasOne(() => PermissionType)
    public type: HasOne<typeof PermissionType>

    /**
     * The user that the permission `cookie` belongs to. heh.
     */
    @column()
    public userId: number

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime
}
