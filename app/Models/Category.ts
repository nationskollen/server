/**
 * @category Model
 * @module Category
 */
import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'

export default class Category extends BaseModel {
    /**
     * The id of the category
     */
    @column({ isPrimary: true })
    public id: number

    /**
     * The category
     */
    @column()
    public uniqueId: number

    /**
     * The date the model was created
     */
    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    /**
     * The date the model was updated
     */
    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    /**
     * Ordering options to query categories at ascending order
     */
    public static inOrder = scope((query) => {
        query.orderBy('uniqueId', 'asc')
    })
}
