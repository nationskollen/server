import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ActivityValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        change: schema.number(),
    })

    public messages = {}
}
