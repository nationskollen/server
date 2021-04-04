import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LocationValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string.optional({}, [
            rules.alpha({
                allow: ['space', 'dash'],
            }),
        ]),
        description: schema.string.optional(),
        address: schema.string.optional(),
        max_capacity: schema.number.optional([rules.unsigned(), rules.range(1, 5000)]),
    })

    public messages = {}
}
