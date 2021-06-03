/**
 * @category Validator
 * @module NewsCreateValidator
 */
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NewsCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        title: schema.string(),
        short_description: schema.string(),
        long_description: schema.string(),
    })

    public messages = {}
}
