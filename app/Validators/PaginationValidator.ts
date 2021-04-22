/**
 * @catgory Validator
 * @module PaginationValidator
 */
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PaginationValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        /**
         * @todo This feels rather hardcoded but works for now.
         * Refactoring could be creating your own rule
         * @see {@link https://preview.adonisjs.com/guides/validator/custom-rules | Custom rules - adonisjs}
         */
        page: schema.number.optional([rules.range(1, 5000)]),
        amount: schema.number.optional([rules.unsigned()]),
    })

    public messages = {}
}
