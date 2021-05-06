import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'
import { toAbsolutePath } from 'App/Utils/Serialize'

export default class Person extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    /**
     * The nation the person belongs to
     */
    @column()
    public nationId: number

    /**
     * name for a given person
     */
    @column()
    public name: string

    /**
     * Role for a given person
     */
    @column()
    public role: string

    /**
     * Description for a given person
     */
    @column()
    public description: string

    /**
     * group for a given person
     *
     * @todo add maybe so that a person belongs to a given part of a nation?
     * perhaps someone that is working in the cafe needs to be placed in a
     * model that has cafe persons
     */

    /**
     * Cover image for the person to be displayed
     */
    @column({ serialize: toAbsolutePath })
    public coverImgSrc: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    /**
     * Ordering options to query categories at ascending order
     */
    public static inOrder = scope((query) => {
        query.orderBy('name', 'asc')
    })
}
