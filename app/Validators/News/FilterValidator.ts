/**
 * @category Validator
 * @module NewsFilterValidator
 */
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NewsFilterValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        date: schema.date.optional({ format: 'yyyy-LL-dd' }),
        before: schema.date.optional({ format: 'yyyy-LL-dd' }),
        after: schema.date.optional({ format: 'yyyy-LL-dd' }),
        exclude_oids: schema.string.optional(),
    })

    public messages = {}
}
