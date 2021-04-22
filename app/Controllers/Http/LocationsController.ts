/**
 * The LocationsController contains all the methods that are available to perform
 * on {@link Location | location models} in the system.
 *
 * Only an admin of a nation can perform the given operations on its own nation.
 *
 * @category Controller
 * @module LocationsController
 */
import Location from 'App/Models/Location'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import ActivityValidator from 'App/Validators/Locations/ActivityValidator'
import { getNation, getLocation, getValidatedData } from 'App/Utils/Request'
import LocationUpdateValidator from 'App/Validators/Locations/UpdateValidator'
import LocationCreateValidator from 'App/Validators/Locations/CreateValidator'
import LocationUploadValidator from 'App/Validators/Locations/UploadValidator'

export default class LocationsController {
    /**
     * fetch all locations in a nation
     */
    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const locations = await Location.withPreloads().where('nationId', oid)

        return locations.map((location: Location) => location.toJSON())
    }

    /**
     * fetch a single location
     */
    public async single({ request }: HttpContextContract) {
        return getLocation(request).toJSON()
    }

    /**
     * Fetch all locations that should be display on the map
     */
    public async onMap(_: HttpContextContract) {
        const locations = await Location.query()
            .preload('openingHours')
            .preload('openingHourExceptions')
            .where('showOnMap', true)

        return locations.map((location: Location) => location.toJSON())
    }

    /**
     * create a location
     */
    public async create({ request }: HttpContextContract) {
        const nation = getNation(request)
        const data = await getValidatedData(request, LocationCreateValidator)
        const location = await nation.related('locations').create(data)

        return location.toJSON()
    }

    /**
     * update a location
     */
    public async update({ request }: HttpContextContract) {
        const location = getLocation(request)
        const changes = await getValidatedData(request, LocationUpdateValidator)

        // Apply the changes that was requested and save
        location.merge(changes)
        await location.save()

        return location.toJSON()
    }

    /**
     * delete a location
     */
    public async delete({ request }: HttpContextContract) {
        const location = getLocation(request)
        await location.delete()
    }

    /**
     * change the activity at a location
     * Can be performed by running:
     * ```json
     *  {
     *      "change": 30 #for example
     *  }
     * ```
     */
    public async activity({ request }: HttpContextContract) {
        const location = getLocation(request)
        const { change } = await getValidatedData(request, ActivityValidator)

        // Clamp value between 0 and maxCapacity.
        // NOTE: We must make sure that the resulting value is an integer.
        // If this value would be a non-integer, the insert query will fail
        // when using PostgreSQL (production database).
        location.estimatedPeopleCount = Math.round(
            Math.min(Math.max(0, location.estimatedPeopleCount + change), location.maxCapacity)
        )

        await location.save()

        return location.toJSON()
    }

    /**
     * Open a location
     */
    public async open({ request }: HttpContextContract) {
        const location = await getLocation(request).setOpen()

        return location.toJSON()
    }

    /**
     * Close a location
     */
    public async close({ request }: HttpContextContract) {
        const location = await getLocation(request).setClosed()

        return location.toJSON()
    }

    /**
     * upload a file to a location
     */
    public async upload({ request }: HttpContextContract) {
        const location = getLocation(request)
        const { cover } = await getValidatedData(request, LocationUploadValidator)
        const filename = await attemptFileUpload(cover)

        if (filename) {
            attemptFileRemoval(location.coverImgSrc)
            location.coverImgSrc = filename
        }

        // Update cover image
        await location.save()

        return location.toJSON()
    }
}
