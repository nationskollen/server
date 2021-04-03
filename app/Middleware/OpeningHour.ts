import OpeningHour from 'App/Models/OpeningHour'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

// Verifies that the id param of a route is a valid oid of a student nation
export default class OpeningHourMiddleware {
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const model = await OpeningHour.findOrFail(params.ohid)

        request.openingHour = model

        await next()
    }
}
