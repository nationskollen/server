/**
 * A nation can have individuals that are displayed at a nation page. These
 * indivudals have roles in the nation. This way a nation can inform users of
 * what people are working at the nation
 *
 * @category Model
 * @module Individual
 */
import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'
import { toAbsolutePath } from 'App/Utils/Serialize'

export default class Individual extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    /**
     * The nation the individual belongs to
     */
    @column()
    public nationId: number

    /**
     * name for a given individual
     */
    @column()
    public name: string

    /**
     * Role for a given individual
     */
    @column()
    public role: string

    /**
     * Description for a given individual
     */
    @column()
    public description: string

    /**
     * group for a given individual
     *
     * @todo add maybe so that a individual belongs to a given part of a nation?
     * perhaps someone that is working in the cafe needs to be placed in a
     * model that has cafe persons
     */

    /**
     * Cover image for the individual to be displayed
     */
    @column({ serialize: toAbsolutePath })
    public profileImgSrc: string

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    /**
     * Ordering options to query individuals at ascending order
     */
    public static inOrder = scope((query) => {
        query.orderBy('name', 'asc')
    })
}
