/**
 * @catgory Validator
 * @module CategoryValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CategoryValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({})

    public messages = {}
}
