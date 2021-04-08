import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LoginValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        email: schema.string({}, [rules.email()]),
        password: schema.string({}, [rules.minLength(8), rules.maxLength(256)]),
    })

    public messages = {}
}
