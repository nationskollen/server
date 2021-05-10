/**
 * @category Validator
 * @module ContactsCreateValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ContactsCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string(),
        email: schema.string({}, [rules.email()]),
        telephone: schema.string({}, [
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
