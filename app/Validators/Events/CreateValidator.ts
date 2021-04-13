import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EventCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string(),
        description: schema.string(),
        location_id: schema.number.optional(),

        occurs_at: schema.date({ format: 'HH:mm' }, [
            rules.beforeField('end_at'),
        ]),
        end_at: schema.date({ format: 'HH:mm' }, [
            rules.afterField('occurs_at'),
        ]),
    })

    public messages = {}
}

