import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { toBoolean } from 'App/Utils/Serialize'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public email: string

    @column({ serializeAs: null })
    public password: string

    // The nation that this user is a part of
    @column({ serializeAs: 'oid' })
    public nationId: number

    // If the user is a nation admin
    @column({ serializeAs: null, consume: toBoolean })
    public nationAdmin: boolean

    @column()
    public rememberMeToken?: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password)
        }
    }
}
