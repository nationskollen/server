import { DateTime } from 'luxon'
import { toBoolean } from 'App/Utils/Serialize'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class MenuItem extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public menuId: number

    @column()
    public name: string

    @column()
    public description: string

    @column()
    public price: number

    @column()
    public coverImgSrc: string

    @column({ consume: toBoolean })
    public hidden: boolean

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}