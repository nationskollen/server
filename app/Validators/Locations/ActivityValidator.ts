/**
 * @category Validator
 * @module ActivityValidator
 */
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ActivityValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        change: schema.number.optional([rules.requiredIfNotExists('exact_amount')]),
        exact_amount: schema.number.optional([
            rules.unsigned(),
            rules.requiredIfNotExists('change'),
        ]),
    })

    public messages = {}
}
