import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LocationUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string.optional(),
        description: schema.string.optional(),
        locationId: schema.number.optional(),
        occursAt: schema.date.optional({ format: 'HH:mm' }, [
            rules.beforeField('endAt'),
        ]),
        endAt: schema.date.optional({ format: 'HH:mm' }, [
            rules.afterField('occursAt'),
        ]),
    })

    public messages = {}
}
