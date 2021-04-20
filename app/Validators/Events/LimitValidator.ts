import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EventLimitValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        amount: schema.number.optional(),
        pageAmount: schema.number.optional(),
    })

    public messages = {}
}
