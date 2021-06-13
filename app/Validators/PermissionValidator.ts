/**
 * @catgory Validator
 * @module PermissionValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DatabaseTables } from 'App/Utils/Database'

export default class PermissionValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        user_id: schema.number([
            rules.exists({
                table: DatabaseTables.Users,
                column: 'id',
            }),
        ]),
        permission_type_id: schema.number([
            rules.exists({
                table: DatabaseTables.PermissionTypes,
                column: 'id',
            }),
        ]),
    })

    public messages = {}
}
