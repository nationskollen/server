/**
 * @category Validator
 * @module LocationCreateValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LocationCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string(),
        description: schema.string(),
        address: schema.string(),
        show_on_map: schema.boolean.optional(),
        latitude: schema.number.optional([
            rules.requiredWhen('show_on_map', '=', true),
            rules.range(-90, 90),
        ]),
        longitude: schema.number.optional([
            rules.requiredWhen('show_on_map', '=', true),
            rules.range(-180, 180),
        ]),
        activity_level_disabled: schema.boolean.optional(),
        is_default: schema.boolean.optional(),
        max_capacity: schema.number([rules.unsigned(), rules.range(1, 5000)]),
    })

    public messages = {}
}
