import { ActivityLevels } from 'App/Utils/Activity'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NationInformationValidator {
    constructor (protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string.optional({}, [
            rules.alpha(),
            rules.unique({
                table: 'nations',
                column: 'name',
            })
        ]),
        short_name: schema.string.optional({}, [
            rules.alpha(),
        ]),
        description: schema.string.optional(),
        address: schema.string.optional(),
        max_capacity: schema.number.optional([ rules.unsigned() ]),
        estimated_people_count: schema.number.optional([ rules.unsigned() ]),
        activity_level: schema.number.optional([
            rules.range(0, Object.keys(ActivityLevels).length)
        ]),
        accent_color: schema.string.optional({}, [
            rules.regex(/^#[a-fA-F0-9]{6}$/)
        ]),
    })

    public messages = {}
}
