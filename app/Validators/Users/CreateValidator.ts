/**
 * @category Validator
 * @module UserCreateValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MIN_LENGTH_PASSWORD, MAX_LENGTH_PASSWORD } from 'App/Utils/Constants'

export default class UserCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        full_name: schema.string(),
        email: schema.string({}, [rules.email()]),
        password: schema.string({}, [
            rules.minLength(MIN_LENGTH_PASSWORD),
            rules.maxLength(MAX_LENGTH_PASSWORD),
        ]),
        nation_admin: schema.boolean(),
    })

    public messages = {}
}
