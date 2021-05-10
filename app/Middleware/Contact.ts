/**
 * Contact middleware handles valid request made to the server and informs the
 * requester if the request is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - {@link ContactNotFound}
 *
 * > You must register this middleware inside
 *   `start/kernel.ts` file under the list of named middleware.
 *
 * @category Middleware
 * @module ContactMiddleware
 *
 */

import Contact from 'App/Models/Contact'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ContactNotFoundException from 'App/Exceptions/ContactNotFoundException'

/**
 * Verifies that the id param of a route is a valid id of a student nations contact model
 */
export default class ContactMiddleware {
    /**
     * Handle request
     */
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        let contact: Contact | null

        contact = await Contact.findBy('id', params.cid)

        if (!contact) {
            throw new ContactNotFoundException()
        }

        request.contact = contact

        await next()
    }
}
