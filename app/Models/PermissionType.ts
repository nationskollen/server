/**
 * @category Model
 * @module PermissionType
 */
import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'

export default class PermissionType extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    /**
     * the type for the permission
     */
    @column()
    public type: string

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    /**
     * Ordering options to query permission types at ascending order
     */
    public static inOrder = scope((query) => {
        query.orderBy('type', 'asc')
    })
}
