/**
 * @category Validator
 * @module NationUploadValidator
 */
import { DatabaseTables } from 'App/Utils/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NationUploadValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string.optional({}, [
            rules.unique({
                table: DatabaseTables.Nations,
                column: 'name',
            }),
        ]),
        short_name: schema.string.optional(),
        description: schema.string.optional(),
        web_url: schema.string.optional({}, [ 
            rules.url({
                protocols: ['http', 'https']
        })]),
        accent_color: schema.string.optional({}, [rules.regex(/^#[a-fA-F0-9]{6}$/)]),
    })

    public messages = {}
}
