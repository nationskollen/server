import { DateTime } from 'luxon'
import Event from 'App/Models/Event'
import { ExtractScopes } from '@ioc:Adonis/Lucid/Model'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import { getNation, getEvent, getValidatedData } from 'App/Utils/Request'
import EventUpdateValidator from 'App/Validators/Events/UpdateValidator'
import EventCreateValidator from 'App/Validators/Events/CreateValidator'
import EventUploadValidator from 'App/Validators/Events/UploadValidator'
import EventFilterValidator from 'App/Validators/Events/FilterValidator'

export default class EventsController {
    private applyFilters(
        scopes: ExtractScopes<typeof Event>,
        filters: Record<string, DateTime | undefined>
    ) {
        // Skip any other filters if we filter for events on a certain date
        if (filters.date) {
            scopes.onDate(filters.date)
        }

        // Filter based on when the event ends, i.e. all events before a certain date
        if (filters.before) {
            scopes.beforeDate(filters.before)
        }

        // Filter based on when the event start, i.e. all events after a certain date
        if (filters.after) {
            scopes.afterDate(filters.after)
        }
    }

    public async all({ request }: HttpContextContract) {
        const filters = await getValidatedData(request, EventFilterValidator, true)
        const events = await Event.query().apply((scopes) => this.applyFilters(scopes, filters))

        return events.map((event: Event) => event.toJSON())
    }

    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const filters = await getValidatedData(request, EventFilterValidator, true)
        const events = await Event.query()
            .where('nation_id', oid)
            .apply((scopes) => this.applyFilters(scopes, filters))

        return events.map((event: Event) => event.toJSON())
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
