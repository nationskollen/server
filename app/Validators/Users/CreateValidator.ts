/**
 * @category Validator
 * @module UserCreateValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        fullname: schema.string(),
        email: schema.string({}, [rules.email()]),
        password: schema.string({}, [rules.minLength(8), rules.maxLength(256)]),
        nationAdmin: schema.boolean(),
    })

    public messages = {}
}
