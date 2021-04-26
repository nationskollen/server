/**
 * @catgory Validator
 * @module SubscriptionCreateValidator
 */
import { DatabaseTables } from 'App/Utils/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SubscriptionCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        token: schema.string({ trim: true }, [rules.expoToken()]),
        oid: schema.number([
            rules.exists({
                table: DatabaseTables.Nations,
                column: 'oid',
            }),
        ]),
        topic: schema.number([
            rules.exists({
                table: DatabaseTables.SubscriptionTopics,
                column: 'id',
            }),
        ]),
    })

    public messages = {}
}
