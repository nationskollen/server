import Location from 'App/Models/Location'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LocationNotFoundException from 'App/Exceptions/LocationNotFoundException'

export default class LocationMiddleware {
    public async handle(
        { request, params }: HttpContextContract,
        next: () => Promise<void>,
        options: string[]
    ) {
        let location: Location | null

        if (options.includes('with-hours')) {
            location = await Location.withOpeningHours(params.lid)
        } else {
            location = await Location.find(params.lid)
        }

        if (!location) {
            throw new LocationNotFoundException()
        }

        request.location = location

        await next()
    }
}
