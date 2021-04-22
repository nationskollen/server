/**
 * Event middleware handles valid request made to the server and informs the
 * requester if the request is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - {@link EventNotFoundException}
 *
 * > You must register this middleware inside
 *   `start/kernel.ts` file under the list of named middleware.
 *
 * @category Middleware
 * @module EventMiddleware
 *
 */

import Event from 'App/Models/Event'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EventNotFoundException from 'App/Exceptions/EventNotFoundException'

export default class EventMiddleware {
    /**
     * Handle request
     */
    public async handle(
        { request, params }: HttpContextContract,
        next: () => Promise<void>,
        options: string[]
    ) {
        let event: Event | null

        if (options.includes('preload')) {
            event = await Event.query().where('id', params.eid).preload('category').first()
        } else {
            event = await Event.find(params.eid)
        }

        if (!event) {
            throw new EventNotFoundException()
        }

        request.event = event

        await next()
    }
}
