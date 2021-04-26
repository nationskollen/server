/**
 * @catgory Validator
 * @module SubscriptionQueryValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SubscriptionQueryValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        token: schema.string({}, [rules.expoToken()]),
    })

    public messages = {}
}
