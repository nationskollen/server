/**
 * @category Validator
 * @module IndividualCreateValidator
 */
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IndividualCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string(),
        description: schema.string.optional(),
        role: schema.string.optional(),
    })

    public messages = {}
}
