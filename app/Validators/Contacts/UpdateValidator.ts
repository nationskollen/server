/**
 * @category Validator
 * @module ContactUpdateValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ContactUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        email: schema.string.optional({}, [rules.email()]),
        telephone: schema.string.optional({}, [
            rules.mobile({
                locales: ['sv-SE'],
            }),
        ]),
        web_url: schema.string.optional({}, [
            rules.url({
                protocols: ['http', 'https'],
            }),
        ]),
    })

    public messages = {}
}
