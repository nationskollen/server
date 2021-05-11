import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Contact extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    /**
     * The nation the individual belongs to
     */
    @column({ serializeAs: null })
    public nationId: number

    @column()
    public name: string

    @column()
    public email: string

    @column()
    public telephone: string

    /**
     * web url to a nation, can be specified to any website
     */
    @column()
    public webURL: string

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime
}
