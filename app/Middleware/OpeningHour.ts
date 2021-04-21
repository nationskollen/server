/**
 * Opening hour middleware handles valid request made to the server and informs the
 * requester if the request is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - {@link OpeningHourNotFoundException}
 *
 * > You must register this middleware inside
 *   `start/kernel.ts` file under the list of named middleware.
 *
 * @category Middleware
 * @module OpeningHourMiddleware
 *
 */

import OpeningHour from 'App/Models/OpeningHour'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OpeningHourNotFoundException from 'App/Exceptions/OpeningHourNotFoundException'

export default class OpeningHourMiddleware {
    /**
     * Handle request
     */
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const openingHour = await OpeningHour.query().where('id', params.hid).first()

        if (!openingHour) {
            throw new OpeningHourNotFoundException()
        }

        request.openingHour = openingHour

        await next()
    }
}
