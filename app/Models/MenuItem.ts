/**
 * A menu item is an object that specifies something that a nation might want
 * to put in their menu. This could be something as a sandwich, a drink or
 * whatever.
 *
 * A menu item cannot be created if there is no menu available at a location
 * that has been specified by a nation.
 *
 * @module MenuItem
 */

import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { toBoolean, toAbsolutePath } from 'App/Utils/Serialize'

export default class MenuItem extends BaseModel {
    /**
     * Id for the menu item
     */
    @column({ isPrimary: true })
    public id: number

    /**
     * Id belonging to the menu the item is placed in
     */
    @column()
    public menuId: number

    /**
     * what the menu item is named
     */
    @column()
    public name: string

    /**
     * description on the item
     */
    @column()
    public description: string

    /**
     * the price of the item
     */
    @column()
    public price: number

    /**
     * an image for the item to be displayed
     */
    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    /**
     * the option to hide the item in the menu or not
     */
    @column({ consume: toBoolean })
    public hidden: boolean

    /**
     * When the item was created
     */
    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    /**
     * When the item was updated
     */
    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
