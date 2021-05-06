/**
 * Person middleware handles valid request made to the server and informs the
 * requester if the request is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - {@link PersonNotFoundException}
 *
 * > You must register this middleware inside
 *   `start/kernel.ts` file under the list of named middleware.
 *
 * @category Middleware
 * @module PersonMiddleware
 *
 */

import Person from 'App/Models/Person'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PersonNotFoundException from 'App/Exceptions/PersonNotFoundException'

/**
 * Verifies that the id param of a route is a valid id of a person in the system
 */
export default class PersonMiddleware {
    /**
     * Handle request
     */
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        let person: Person | null

        person = await Person.find(params.id)

        if (!person) {
            throw new PersonNotFoundException()
        }

        request.person = person

        await next()
    }
}
