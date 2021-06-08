/**
 * @category Validator
 * @module NewsUpdateValidator
 */
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NewsUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        title: schema.string.optional(),
        short_description: schema.string.optional(),
        long_description: schema.string.optional(),
    })

    public messages = {}
}
