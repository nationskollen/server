/**
 * @category Validator
 * @module IndividualUpdateValidator
 */
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IndividualUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string.optional(),
        description: schema.string.optional(),
        role: schema.string.optional(),
    })

    public messages = {}
}
