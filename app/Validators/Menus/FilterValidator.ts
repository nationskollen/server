/**
 * @category Validator
 * @module MenuFilterValidator
 */
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MenuFilterValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        hidden: schema.boolean.optional(),
    })

    public messages = {}
}
