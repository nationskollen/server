/**
 * @category Validator
 * @module UserUpdateValidator
 */
import { DatabaseTables } from 'App/Utils/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MIN_LENGTH_PASSWORD, MAX_LENGTH_PASSWORD } from 'App/Utils/Constants'

export default class UserUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        full_name: schema.string.optional(),
        email: schema.string.optional({}, [
            rules.email(),
            rules.unique({
                table: DatabaseTables.Users,
                column: 'email',
            }),
        ]),
        password: schema.string.optional({}, [
            rules.minLength(MIN_LENGTH_PASSWORD),
            rules.maxLength(MAX_LENGTH_PASSWORD),
        ]),
    })

    public messages = {}
}
