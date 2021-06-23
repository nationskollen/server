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
import { Permissions } from 'App/Utils/Permissions'
import ActivityValidator from 'App/Validators/Locations/ActivityValidator'
import { getNation, getLocation, getValidatedData } from 'App/Utils/Request'
import LocationUpdateValidator from 'App/Validators/Locations/UpdateValidator'
import LocationCreateValidator from 'App/Validators/Locations/CreateValidator'
import LocationUploadValidator from 'App/Validators/Locations/UploadValidator'
import ActivityLevelsDisabledException from 'App/Exceptions/ActivityLevelsDisabledException'

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
     * create a location
     */
    public async create({ bouncer, request }: HttpContextContract) {
        const nation = getNation(request)
        await bouncer.authorize('permissions', Permissions.Locations, nation.oid)

        const data = await getValidatedData(request, LocationCreateValidator)
        const location = await nation.related('locations').create(data)

        if (data.is_default) {
            await Location.setNotDefault(nation.oid)
        }

        return location.toJSON()
    }

    /**
     * update a location
     */
    public async update({ bouncer, request }: HttpContextContract) {
        const location = getLocation(request)
        await bouncer.authorize('permissions', Permissions.Locations, location.nationId)

        const changes = await getValidatedData(request, LocationUpdateValidator)

        if (changes.is_default && !location.isDefault) {
            await Location.setNotDefault(location.nationId)
        }

        // Apply the changes that was requested and save
        location.merge(changes)
        await location.save()

        return location.toJSON()
    }

    /**
     * delete a location
     */
    public async delete({ bouncer, request }: HttpContextContract) {
        const location = getLocation(request)
        await bouncer.authorize('permissions', Permissions.Locations, location.nationId)

        if (location.isDefault) {
            await Location.setNotDefault(location.nationId)
        }

        await location.delete()
    }

    private static async performActivityAction(
        location: Location,
        change: number | undefined,
        exact_amount: number | undefined
    ) {

        if (exact_amount) {
            location.estimatedPeopleCount = exact_amount
        } else if (change) {
            // Clamp value between 0 and maxCapacity.
            // NOTE: We must make sure that the resulting value is an integer.
            // If this value would be a non-integer, the insert query will fail
            // when using PostgreSQL (production database).
            location.estimatedPeopleCount = Math.round(
                Math.min(Math.max(0, location.estimatedPeopleCount + change), location.maxCapacity)
            )
        } 

        await location.save()
    }

    /**
     * change the activity at a location
     * Can be performed by running:
     * @example
     * ```json
     *  {
     *      "change": 30
     *  }
     * ```
     * or 
     * @example
     * ```json
     * {
     *  "exact_amount": 140
     * }
     *  ```
     */
    public async activity({ bouncer, request }: HttpContextContract) {
        const location = getLocation(request)
        await bouncer.authorize('permissions', Permissions.Activity, location.nationId)

        if (location.activityLevelDisabled) {
            throw new ActivityLevelsDisabledException()
        }

        const { change, exact_amount } = await getValidatedData(request, ActivityValidator)

        await LocationsController.performActivityAction(location, change, exact_amount)

        return location.toJSON()
    }

    /**
     * Open a location
     */
    public async open({ bouncer, request }: HttpContextContract) {
        const location = getLocation(request)
        await bouncer.authorize('permissions', Permissions.Locations, location.nationId)

        await location.setOpen()

        return location.toJSON()
    }

    /**
     * Close a location
     */
    public async close({ bouncer, request }: HttpContextContract) {
        const location = getLocation(request)
        await bouncer.authorize('permissions', Permissions.Locations, location.nationId)

        await location.setClosed()

        return location.toJSON()
    }

    /**
     * upload a file to a location
     */
    public async upload({ bouncer, request }: HttpContextContract) {
        const location = getLocation(request)
        await bouncer.authorize('permissions', Permissions.Locations, location.nationId)

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
