import { DatabaseTables } from 'App/Utils/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EventCreateValidator {
    constructor(protected ctx: HttpContextContract) {}

    public refs = schema.refs({ nationId: this.ctx.request?.nation?.oid })

    public schema = schema.create({
        name: schema.string(),
        description: schema.string(),
        location_id: schema.number.optional([
            rules.exists({
                table: DatabaseTables.Locations,
                column: 'id',
                where: { nation_id: this.refs.nationId },
            }),
        ]),

        occurs_at: schema.date({ format: 'iso' }, [rules.beforeField('ends_at')]),
        ends_at: schema.date({ format: 'iso' }, [rules.afterField('occurs_at')]),
    })

    public messages = {}
}
