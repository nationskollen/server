/**
 * @category Validator
 * @module NotificationFilterValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NotificationFilterValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        after: schema.date.optional({
            format: 'iso',
        }),
        token: schema.string.optional({}, [rules.expoToken()]),
    })

    public messages = {}
}
