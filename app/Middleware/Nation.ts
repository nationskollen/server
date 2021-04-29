/**
 * Nation middleware handles valid request made to the server and informs the
 * requester if the request is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - {@link NationNotFoundException}
 *
 * > You must register this middleware inside
 *   `start/kernel.ts` file under the list of named middleware.
 *
 * @category Middleware
 * @module NationMiddleware
 *
 */

import Nation from 'App/Models/Nation'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NationNotFoundException from 'App/Exceptions/NationNotFoundException'

/**
 * Verifies that the id param of a route is a valid oid of a student nation
 */
export default class NationMiddleware {
    /**
     * Handle request
     */
    public async handle(
        { request, params }: HttpContextContract,
        next: () => Promise<void>,
        options: string[]
    ) {
        let nation: Nation | null

        if (options.includes('preload')) {
            nation = await Nation.withLocations(params.id)
        } else if (options.includes('preloadDefault')) {
            nation = await Nation.query()
                .preload('defaultLocation', (query) => {
                    query.preload('openingHours')
                })
                .where('oid', params.id)
                .first()
        } else {
            nation = await Nation.findBy('oid', params.id)
        }

        if (!nation) {
            throw new NationNotFoundException()
        }

        request.nation = nation

        await next()
    }
}
