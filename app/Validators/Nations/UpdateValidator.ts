/**
 * @category Validator
 * @module NationUploadValidator
 */
import { getOidRef } from 'App/Utils/Validator'
import { DatabaseTables } from 'App/Utils/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NationUploadValidator {
    constructor(protected ctx: HttpContextContract) {}

    public refs = schema.refs({ nationId: getOidRef(this.ctx) })

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
        default_location_id: schema.number.optional([
            rules.unsigned(),
            rules.exists({
                table: DatabaseTables.Locations,
                column: 'id',
                where: { nation_id: this.refs.nationId },
            }),
        ]),
        accent_color: schema.string.optional({}, [rules.regex(/^#[a-fA-F0-9]{6}$/)]),
    })

    public messages = {}
}
