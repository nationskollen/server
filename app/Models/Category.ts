/**
 * @category Model
 * @module Category
 */
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { Categories } from 'App/Utils/Categories'

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
    public name: Categories

    /**
     * The date the model was created
     */
    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    /**
     * The date the model was updated
     */
    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
