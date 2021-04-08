import { Days, OpeningHourTypes } from 'App/Utils/Time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class OpeningHourUpdateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        type: schema.enum.optional([OpeningHourTypes.Default, OpeningHourTypes.Exception]),
        day: schema.enum.optional(
            [
                Days.Monday,
                Days.Tuesday,
                Days.Wednesday,
                Days.Thursday,
                Days.Friday,
                Days.Saturday,
                Days.Sunday,
            ],
            [rules.requiredWhen('type', '=', OpeningHourTypes.Default)]
        ),
        day_special: schema.string.optional({}, [
            rules.minLength(1),
            rules.requiredWhen('type', '=', OpeningHourTypes.Exception),
        ]),
        day_special_date: schema.date.optional({ format: 'd/M' }, [
            rules.requiredWhen('type', '=', OpeningHourTypes.Exception),
        ]),
        open: schema.date.optional({ format: 'HH:mm' }, [
            rules.requiredWhen('is_open', '=', true),
            rules.requiredIfExistsAny(['day']),
            rules.beforeField('close'),
        ]),
        close: schema.date.optional({ format: 'HH:mm' }, [
            rules.requiredWhen('is_open', '=', true),
            rules.requiredIfExistsAny(['day']),
            rules.afterField('open'),
        ]),
        is_open: schema.boolean.optional(),
    })

    public messages = {}
}
