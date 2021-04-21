/**
 * The OpeningHoursController contains all the methods that are available to perform
 * on {@link OpeningHour | opening hours models} in the system.
 *
 * Only an admin of a nation can perform the given operations on its own nation.
 *
 * @category Controller
 * @module MenusController
 */
import OpeningHour from 'App/Models/OpeningHour'
import { OpeningHourTypes } from 'App/Utils/Time'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import InternalErrorException from 'App/Exceptions/InternalErrorException'
import { getLocation, getOpeningHour, getValidatedData } from 'App/Utils/Request'
import OpeningHourCreateValidator from 'App/Validators/OpeningHours/CreateValidator'
import OpeningHourUpdateValidator from 'App/Validators/OpeningHours/UpdateValidator'

export default class OpeningHoursController {
    /**
     * Fetch all opening hours in a location
     */
    public async index({ request }: HttpContextContract) {
        const location = getLocation(request)
        const hours = await OpeningHour.query().where('location_id', location.id)

        return hours.map((hour) => hour.toJSON())
    }

    /**
     * Fetch a single opening hour in a location
     */
    public async single({ request }: HttpContextContract) {
        return getOpeningHour(request).toJSON()
    }

    /**
     * create opening hour for a location
     */
    public async create({ request }: HttpContextContract) {
        const data = await getValidatedData(request, OpeningHourCreateValidator)
        const location = getLocation(request)

        const relation =
            data.type === OpeningHourTypes.Default ? 'openingHours' : 'openingHourExceptions'

        // TODO: Remove opening hour if it already exists for the selected
        // day/day_special?
        const model = await location.related(relation).create(data)

        if (!model) {
            throw new InternalErrorException("Unable to add 'opening hour' to database")
        }

        return model.toJSON()
    }

    /**
     * Update opening hour in a location
     */
    public async update({ request }: HttpContextContract) {
        const changes = await getValidatedData(request, OpeningHourUpdateValidator)
        const openingHour = getOpeningHour(request)

        openingHour.merge(changes)
        await openingHour.save()

        return openingHour.toJSON()
    }

    /**
     * Delete opening hour
     */
    public async delete({ request }: HttpContextContract) {
        await getOpeningHour(request).delete()
    }
}
