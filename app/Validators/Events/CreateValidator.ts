/**
 * @category Validator
 * @module EventCreateValidator
 */
import { getOidRef } from 'App/Utils/Validator'
import { DatabaseTables } from 'App/Utils/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EventCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public refs = schema.refs({ nationId: getOidRef(this.ctx) })
    public schema = schema.create({
        name: schema.string(),
        short_description: schema.string(),
        long_description: schema.string(),
        location_id: schema.number.optional([
            rules.exists({
                table: DatabaseTables.Locations,
                column: 'id',
                where: { nation_id: this.refs.nationId },
            }),
        ]),

        only_members: schema.boolean.optional(),
        only_students: schema.boolean.optional(),
        category_id: schema.number.optional([
            rules.exists({
                table: DatabaseTables.Categories,
                column: 'id',
            }),
        ]),

        occurs_at: schema.date({ format: 'iso' }, [rules.beforeField('ends_at')]),
        ends_at: schema.date({ format: 'iso' }, [rules.afterField('occurs_at')]),
    })

    public messages = {}
}
