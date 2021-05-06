/**
 * Person middleware handles valid request made to the server and informs the
 * requester if the request is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - {@link IndividualNotFoundException}
 *
 * > You must register this middleware inside
 *   `start/kernel.ts` file under the list of named middleware.
 *
 * @category Middleware
 * @module IndividualMiddleware
 *
 */

import Individual from 'App/Models/Individual'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import IndividualNotFoundException from 'App/Exceptions/IndividualNotFoundException'

/**
 * Verifies that the id param of a route is a valid id of a individual in the system
 */
export default class IndividualMiddleware {
    /**
     * Handle request
     */
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        let individual: Individual | null

        individual = await Individual.findby('id', params.id)

        if (!individual) {
            throw new IndividualNotFoundException()
        }

        request.individual = individual

        await next()
    }
}
