/**
 * A nation can have contact information that are displayed at a nation page.
 *
 * @category Model
 * @module Contact
 */

import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Contact extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    /**
     * The nation the individual belongs to
     */
    @column()
    public nationId: number

    /**
     * The email of the contact model
     */
    @column()
    public email: string

    /**
     * The telephone of the contact model
     * uses format: sv-SE (can be seen and configured in {@link ContactCreateValidator} and {@link ContactUpdateValidator})
     */
    @column()
    public telephone: string

    /**
     * web url to a nation, can be specified to any website
     * Only accepts `http` and `https` websites.
     * Can be configured in {@link ContactCreateValidator} and {@link ContactUpdateValidator}
     */
    @column()
    public webURL: string

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime
}
