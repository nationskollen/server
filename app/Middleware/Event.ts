import Event from 'App/Models/Event'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EventNotFoundException from 'App/Exceptions/EventNotFoundException'

export default class EventMiddleware {
    public async handle(
        { request, params }: HttpContextContract,
        next: () => Promise<void>,
    ) {
        let event: Event | null

        event = await Event.find(params.eid)

        if (!event) {
            throw new EventNotFoundException()
        }

        request.event = event

        await next()
    }
}
