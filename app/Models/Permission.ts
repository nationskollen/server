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
import { BaseModel, column, hasMany, HasMany} from '@ioc:Adonis/Lucid/Orm'
import { Permissions } from 'App/Utils/Permission'
import User from 'App/Models/User'

export default class Permission extends BaseModel {
  @column({ isPrimary: true, serializeAs: null})
  public id: number

    /**
     * The permission type the permission model is belongs to
     */
    @column()
    public type: Permissions 

    @hasMany(() => User)
    public users: HasMany<typeof User>

  @column.dateTime({ autoCreate: true, serializeAs: null})
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null})
  public updatedAt: DateTime
}
