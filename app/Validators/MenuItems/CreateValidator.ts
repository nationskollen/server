/**
 * @category Validator
 * @module MenuItemCreateValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MenuItemCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string(),
        description: schema.string({}, []),
        price: schema.number.optional([rules.unsigned()]),
        hidden: schema.boolean(),
    })

    public messages = {}
}
