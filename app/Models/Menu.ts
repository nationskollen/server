/**
 * The menu model which is specified at locations of nations.
 * Each menu can hold `n`-amount of {@link MenuItem} models.
 *
 * @category Model
 * @module Menu
 */
import { DateTime } from 'luxon'
import MenuItem from 'App/Models/MenuItem'
import { toBoolean, toAbsolutePath } from 'App/Utils/Serialize'
import { BaseModel, column, hasMany, HasMany, scope } from '@ioc:Adonis/Lucid/Orm'

export default class Menu extends BaseModel {
    /**
     * The id of the menu
     */
    @column({ isPrimary: true })
    public id: number

    /**
     * The id of the nation the menu belongs to
     */
    // TODO: Is there a better way to associate data with a specific nation?
    //       Or rather, is there an easier way to verify that a certain user is
    //       allowed to access the resource? Right now, we must extract the oid
    //       somehow from every resource that we need to modify.
    @column({ serializeAs: 'oid' })
    public nationId: number

    /**
     * The id of the location the menu belongs to
     */
    @column()
    public locationId: number

    /**
     * The name of the menu
     */
    @column()
    public name: string

    /**
     * The name of the menu
     */
    @column()
    public description: string

    /**
     * Wether if the menu will be displayed or not
     */
    @column({ consume: toBoolean })
    public hidden: boolean

    /**
     * Icon image for the menu to be displayed
     */
    @column({ serialize: toAbsolutePath })
    public iconImgSrc: string

    /**
     * Cover image for the menu to be displayed
     */
    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    /**
     * Which date the menu was created at
     */
    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    /**
     * Which date the menu was updated at
     */
    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    /**
     * The items that belong inside the menu
     */
    @hasMany(() => MenuItem, { serializeAs: 'items' })
    public items: HasMany<typeof MenuItem>

    /**
     * Method to display menus depending on specific location
     * @param id - the location id
     */
    public static async allMenus(locationId: number) {
        return this.query().where('location_id', locationId)
    }

    /**
     * filtering options to query menus for wether they are hidden or not
     * @param hidden the boolean for the menu to query for
     */
    public static showHidden = scope((query, show: boolean) => {
        query.where('hidden', show)
    })
}
