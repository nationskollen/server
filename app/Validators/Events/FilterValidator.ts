/**
 * @category Validator
 * @module EventFilterValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EventFilterValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        date: schema.date.optional({ format: 'yyyy-LL-dd' }),
        before: schema.date.optional({ format: 'yyyy-LL-dd' }),
        after: schema.date.optional({ format: 'yyyy-LL-dd' }),
        category: schema.number.optional([rules.unsigned()]),
        exclude_oids: schema.string.optional(),
        exclude_categories: schema.string.optional(),
        only_members: schema.boolean.optional(),
        only_students: schema.boolean.optional(),
        // recurring: schema.boolean.optional(),
    })

    public messages = {}
}
