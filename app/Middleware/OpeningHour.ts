import { getLocation } from 'App/Utils/Request'
import OpeningHour from 'App/Models/OpeningHour'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OpeningHourNotFoundException from 'App/Exceptions/OpeningHourNotFoundException'

export default class OpeningHourMiddleware {
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const location = getLocation(request)
        const openingHour = await OpeningHour.query()
            .where('id', params.hid)
            .where('locationId', location.id)
            .first()

        if (!openingHour) {
            throw new OpeningHourNotFoundException()
        }

        request.openingHour = openingHour

        await next()
    }
}
