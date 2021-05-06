/**
 * @category Validator
 * @module PersonUpdateValidator
 */
import { getOidRef } from 'App/Utils/Validator'
import { DatabaseTables } from 'App/Utils/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PersonUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public refs = schema.refs({ nationId: getOidRef(this.ctx) })
    public schema = schema.create({
        name: schema.string.optional(),
        description: schema.string.optional(),
        role: schema.string.optional(),
        nation_id: schema.number.optional([
            rules.exists({
                table: DatabaseTables.Nations,
                column: 'oid',
                where: { oid: this.refs.nationId },
            }),
        ]),
    })

    public messages = {}
}
