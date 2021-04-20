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
import EventLimitValidator from 'App/Validators/Events/LimitValidator'

/**
 * Event controller
 */
export default class EventsController {
    private applyFilters(
        scopes: ExtractScopes<typeof Event>,
        filters: Record<string, DateTime | undefined>
    ) {
        if (filters.date) {
            // Filter based on selected date
            scopes.onDate(filters.date)
        } else {
            if (filters.before) {
                // Filter based on when the event ends, i.e. all events before a certain date
                scopes.beforeDate(filters.before)
            }

            if (filters.after) {
                // Filter based on when the event start, i.e. all events after a certain date
                scopes.afterDate(filters.after)
            }
        }

        // Order events based on the 'occurs_at' field
        scopes.inOrder()
    }

    private applyLimit(
        scopes: ExtractScopes<typeof Event>,
        amount?: number | undefined,
        pageAmount?: number | undefined
    ) {
        if (amount && pageAmount) {
            scopes.limitAmount(pageAmount, amount)
        }
    }

    public async all({ request }: HttpContextContract) {
        const filters = await getValidatedData(request, EventFilterValidator, true)
        const specified = await getValidatedData(request, EventLimitValidator, true)

        const events = await Event.query().apply((scopes) => {
            this.applyLimit(scopes, specified?.amount)
            this.applyFilters(scopes, filters)
        })

        return events.map((event: Event) => event.toJSON())
    }

    public async single({ request }: HttpContextContract) {
        return getEvent(request).toJSON()
    }

    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const filters = await getValidatedData(request, EventFilterValidator, true)
        const events = await Event.query()
            .where('nation_id', oid)
            .apply((scopes) => this.applyFilters(scopes, filters))

        return events.map((event: Event) => event.toJSON())
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
