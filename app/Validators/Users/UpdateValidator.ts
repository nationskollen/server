/**
 * @category Validator
 * @module UserUpdateValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        fullname: schema.string.optional(),
        email: schema.string.optional({}, [rules.email()]),
        password: schema.string.optional({}, [rules.minLength(8), rules.maxLength(256)]),
        nationAdmin: schema.boolean.optional(),
    })

    public messages = {}
}
