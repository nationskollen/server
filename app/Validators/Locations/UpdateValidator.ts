/**
 * @category Validator
 * @module LocationUpdateValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LocationUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string.optional({}, [
            rules.alpha({
                allow: ['space', 'dash'],
            }),
        ]),
        description: schema.string.optional(),
        address: schema.string.optional(),
        show_on_map: schema.boolean.optional(),
        latitude: schema.number.optional([
            rules.requiredWhen('show_on_map', '=', true),
            rules.range(-90, 90),
        ]),
        longitude: schema.number.optional([
            rules.requiredWhen('show_on_map', '=', true),
            rules.range(-180, 180),
        ]),
        is_default: schema.boolean.optional(),
        max_capacity: schema.number.optional([rules.unsigned(), rules.range(1, 5000)]),
    })

    public messages = {}
}
