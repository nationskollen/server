/**
 * The EventsController contains the different methods that gives the ability
 * to operate upon {@link Event | Event} models.
 *
 * @category Controller
 * @module EventsController
 */
import { DateTime } from 'luxon'
import Event from 'App/Models/Event'
import { getPageNumber } from 'App/Utils/Paginate'
import { ExtractScopes } from '@ioc:Adonis/Lucid/Model'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import { getNation, getEvent, getValidatedData } from 'App/Utils/Request'
import EventUpdateValidator from 'App/Validators/Events/UpdateValidator'
import EventCreateValidator from 'App/Validators/Events/CreateValidator'
import EventUploadValidator from 'App/Validators/Events/UploadValidator'
import EventFilterValidator from 'App/Validators/Events/FilterValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'

/**
 * Event controller
 */
export default class EventsController {
    /**
     * Method that applies given filters depedning on what type of event to
     * filter after
     * @param scopes - The different scopes that exists in the system
     * @param filters - The filder to apply
     */
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

    private applyCategory(scopes: ExtractScopes<typeof Event>, category?: number) {
        if (category) {
            scopes.perCategory(category)
        }
    }

    private applyInclusionFilter(scopes: ExtractScopes<typeof Event>, membership?: boolean, student?: boolean) {
        scopes.forStudents(!!student)
        scopes.forMembers(!!membership)
    }

    private applyExclusionOids(
        scopes: ExtractScopes<typeof Event>,
        excludeOids?: string | undefined
    ) {
        if (excludeOids) {
            const initial: Array<number> = []
            const parsed = excludeOids.split(',').reduce((reducedArray, oid) => {
                const tmp = parseInt(oid)

                if (!isNaN(tmp)) {
                    reducedArray.push(tmp)
                }

                return reducedArray
            }, initial)

            scopes.filterOutOids(parsed)
        }
    }

    /**
     * Method to retrieve all the events in the system
     * The actual function call is done by a request (CRUD) which are specified
     * in `Routes.ts`
     */
    public async all({ request }: HttpContextContract) {
        const { date, before, after, category, exclude_oids, only_students, only_members } = await getValidatedData(
            request,
            EventFilterValidator,
            true
        )
        const specified = await getValidatedData(request, PaginationValidator, true)

        const query = Event.query()
            .preload('category')
            .apply((scopes) => {
                this.applyFilters(scopes, { date, before, after })
                this.applyCategory(scopes, category)
                this.applyExclusionOids(scopes, exclude_oids)
                this.applyInclusionFilter(scopes, only_students, only_members)
            })

        const events = await query.paginate(getPageNumber(specified.page), specified.amount)
        return events.toJSON()
    }

    /**
     * Method to retrieve a single event in the system
     */
    public async single({ request }: HttpContextContract) {
        return getEvent(request).toJSON()
    }

    /**
     * Method to retrieve the long description of an event
     */
    public async description({ request }: HttpContextContract) {
        const { longDescription, createdAt, updatedAt } = getEvent(request)

        return {
            long_description: longDescription,
            created_at: createdAt,
            updated_at: updatedAt,
        }
    }

    /**
     * Method to retrieve a single event
     */
    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const { date, before, after } = await getValidatedData(request, EventFilterValidator, true)
        const specified = await getValidatedData(request, PaginationValidator, true)

        const query = Event.query()
            .where('nation_id', oid)
            .preload('category')
            .apply((scopes) => {
                this.applyFilters(scopes, { date, before, after })
            })

        const events = await query.paginate(getPageNumber(specified.page), specified.amount)
        return events.toJSON()
    }

    /**
     * Method to create a single event in the system
     */
    public async create({ request }: HttpContextContract) {
        const nation = getNation(request)
        const data = await getValidatedData(request, EventCreateValidator)
        const event = await nation.related('events').create(data)

        // This is so that if we have defined a category when creating an
        // event, it will preload the category with the response.
        if (event.categoryId) {
            await event.preload('category')
        }

        return event.toJSON()
    }

    /**
     * Method to update a single event in the system
     */
    public async update({ request }: HttpContextContract) {
        const event = getEvent(request)
        const changes = await getValidatedData(request, EventUpdateValidator)

        // Apply the changes that was requested and save
        event.merge(changes)
        await event.save()

        if (event.categoryId) {
            await event.preload('category')
        }

        return event.toJSON()
    }

    /**
     * Method to delete a single event in the system
     */
    public async delete({ request }: HttpContextContract) {
        const event = getEvent(request)
        await event.delete()
    }

    /**
     * Method to upload an image to an event in the system
     */
    public async upload({ request }: HttpContextContract) {
        const event = getEvent(request)
        const { icon, cover } = await getValidatedData(request, EventUploadValidator)
        const iconName = await attemptFileUpload(icon, true)
        const coverName = await attemptFileUpload(cover)

        if (iconName) {
            attemptFileRemoval(event.iconImgSrc)
            event.iconImgSrc = iconName
        }

        if (coverName) {
            attemptFileRemoval(event.coverImgSrc)
            event.coverImgSrc = coverName
        }

        // Update cover image
        await event.save()

        if (event.categoryId) {
            await event.preload('category')
        }

        return event.toJSON()
    }
}
