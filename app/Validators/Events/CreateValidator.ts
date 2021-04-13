import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EventCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        name: schema.string({}, [
            rules.alpha(),
        ]),
        description: schema.string(),
        locationId: schema.number.optional(),

        occursAt: schema.date({ format: 'HH:mm' }, [
            rules.beforeField('endAt'),
        ]),
        endAt: schema.date({ format: 'HH:mm' }, [
            rules.afterField('occursAt'),
        ]),
    })

    public messages = {}
}

