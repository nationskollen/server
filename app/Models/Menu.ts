import { DateTime } from 'luxon'
import MenuItem from 'App/Models/MenuItem'
import { toBoolean } from 'App/Utils/Serialize'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'

export default class Menu extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    // TODO: Is there a better way to associate data with a specific nation?
    //       Or rather, is there an easier way to verify that a certain user is
    //       allowed to access the resource? Right now, we must extract the oid
    //       somehow from every resource that we need to modify.
    @column({ serializeAs: 'oid' })
    public nationId: number

    @column()
    public locationId: number

    @column()
    public name: string

    @column({ consume: toBoolean })
    public hidden: boolean

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    @hasMany(() => MenuItem, { serializeAs: 'items' })
    public items: HasMany<typeof MenuItem>

    private static withPreloads() {
        return this.query().preload('items')
    }

    public static async withItems(id: number) {
        return this.withPreloads().where('id', id).first()
    }

    public static async allWithItems(locationId: number) {
        return this.withPreloads().where('location_id', locationId)
    }
}
