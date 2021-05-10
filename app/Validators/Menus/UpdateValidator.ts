/**
 * @category Validator
 * @module MenuUpdateValidator
 */
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MenuUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string.optional(),
        description: schema.string.optional(),
        hidden: schema.boolean.optional(),
    })

    public messages = {}
}
