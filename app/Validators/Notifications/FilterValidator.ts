/**
 * @category Validator
 * @module NotificationFilterValidator
 */
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NotificationFilterValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        after: schema.date.optional({
            format: 'iso',
        }),
    })

    public messages = {}
}
