import OpeningHour from 'App/Models/OpeningHour'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OpeningHourNotFoundException from 'App/Exceptions/OpeningHourNotFoundException'

export default class OpeningHourMiddleware {
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const openingHour = await OpeningHour.query().where('id', params.hid).first()

        if (!openingHour) {
            throw new OpeningHourNotFoundException()
        }

        request.openingHour = openingHour

        await next()
    }
}
