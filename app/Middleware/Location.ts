/**
 * Location middleware handles valid request made to the server and informs the
 * requester if the request is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - {@link LocationNotFoundException}
 *
 * > You must register this middleware inside
 *   `start/kernel.ts` file under the list of named middleware.
 *
 * @category Middleware
 * @module LocationMiddleware
 *
 */

import Location from 'App/Models/Location'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LocationNotFoundException from 'App/Exceptions/LocationNotFoundException'

export default class LocationMiddleware {
    /**
     * Handle request
     */
    public async handle(
        { request, params }: HttpContextContract,
        next: () => Promise<void>,
        options: string[]
    ) {
        let location: Location | null

        if (options.includes('preload')) {
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
