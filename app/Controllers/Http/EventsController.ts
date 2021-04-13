import Event from 'App/Models/Event'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import { getNation, getEvent, getValidatedData } from 'App/Utils/Request'
import EventUpdateValidator from 'App/Validators/Events/UpdateValidator'
import EventCreateValidator from 'App/Validators/Events/CreateValidator'
import EventUploadValidator from 'App/Validators/Events/UploadValidator'

export default class EventsController {
    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        // TODO check the preload thingy, not necessarily part of Event
        const event = await Event.withPreloads().where('nationId', oid)

        return event.map((event: Event) => event.toJSON())
    }

    public async single({ request }: HttpContextContract) {
        return getEvent(request).toJSON()
    }

    public async create({ request }: HttpContextContract) {
        const nation = getNation(request)
        const data = await getValidatedData(request, EventCreateValidator)
        const event = await nation.related('events').create(data)

        return event.toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const event = getEvent(request)
        const changes = await getValidatedData(request, EventUpdateValidator)

        // Apply the changes that was requested and save
        event.merge(changes)
        await event.save()

        return event.toJSON()
    }

    public async delete({ request }: HttpContextContract) {
        const event = getEvent(request)
        await event.delete()
    }

    public async upload({ request }: HttpContextContract) {
        const event = getEvent(request)
        const { cover } = await getValidatedData(request, EventUploadValidator)
        const filename = await attemptFileUpload(cover)

        if (filename) {
            attemptFileRemoval(event.coverImgSrc)
            event.coverImgSrc = filename
        }

        // Update cover image
        await event.save()

        return event.toJSON()
    }
}