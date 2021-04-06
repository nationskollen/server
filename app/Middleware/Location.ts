import Location from 'App/Models/Location'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LocationNotFoundException from 'App/Exceptions/LocationNotFoundException'

export default class LocationMiddleware {
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const location = await Location.withOpeningHours(params.lid)

        if (!location) {
            throw new LocationNotFoundException()
        }

        request.location = location

        await next()
    }
}
