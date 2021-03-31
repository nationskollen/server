import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NationActivityValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        change: schema.number(),
    })

    public messages = {}
}
