import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MenuValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string({}, [
            rules.alpha({
                allow: ['space', 'dash'],
            }),
        ]),
        hidden: schema.boolean(),
    })

    public messages = {}
}
