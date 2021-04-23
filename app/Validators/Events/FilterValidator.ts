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
    })

    public messages = {}
}
