import Location from 'App/Models/Location'
import { getNation } from 'App/Utils/Request'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LocationNotFoundException from 'App/Exceptions/LocationNotFoundException'

export default class LocationMiddleware {
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const nation = getNation(request)
        const location = await Location.withOpeningHours(nation.oid, params.lid)

        if (!location) {
            throw new LocationNotFoundException()
        }

        request.location = location

        await next()
    }
}
