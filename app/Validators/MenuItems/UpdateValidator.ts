/**
 * @category Validator
 * @module MenuItemUpdateValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MenuItemUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string.optional({}, [
            rules.alpha({
                allow: ['space', 'dash'],
            }),
        ]),
        description: schema.string.optional({}, []),
        price: schema.number.optional([rules.unsigned()]),
        hidden: schema.boolean.optional(),
    })

    public messages = {}
}
