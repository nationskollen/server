import { DatabaseTables } from 'App/Utils/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InformationValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string.optional({}, [
            rules.alpha({
                allow: ['space', 'dash'],
            }),
            rules.unique({
                table: DatabaseTables.Nations,
                column: 'name',
            }),
        ]),
        short_name: schema.string.optional({}, [
            rules.alpha({
                allow: ['space', 'dash'],
            }),
        ]),
        description: schema.string.optional(),
        address: schema.string.optional(),
        accent_color: schema.string.optional({}, [rules.regex(/^#[a-fA-F0-9]{6}$/)]),
    })

    public messages = {}
}
