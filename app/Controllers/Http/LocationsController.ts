import Location from 'App/Models/Location'
import ActivityValidator from 'App/Validators/ActivityValidator'
import LocationUpdateValidator from 'App/Validators/LocationUpdateValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getNation, getLocation, getValidatedData } from 'App/Utils/Request'
import LocationCreateValidator from 'App/Validators/LocationCreateValidator'
import InternalErrorException from 'App/Exceptions/InternalErrorException'

export default class LocationsController {
    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const locations = await Location.withPreloads().where('nationId', oid)

        return locations.map((location: Location) => location.toJSON())
    }

    public async single({ request }: HttpContextContract) {
        return getLocation(request).toJSON()
    }

    public async create({ request }: HttpContextContract) {
        const location = await getValidatedData(request, LocationCreateValidator)
        const nation = getNation(request)
        const model = await nation.related('locations').create(location)

        if (!model) {
            throw new InternalErrorException("Unable to apply 'location' to database")
        }

        return model.toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const changes = await getValidatedData(request, LocationUpdateValidator)
        const location = getLocation(request)

        // Apply the changes that was requested and save
        location.merge(changes)
        await location.save()

        return location.toJSON()
    }

    public async delete({ request }: HttpContextContract) {
        const location = getLocation(request)
        await location.delete()
    }

    public async activity({ request }: HttpContextContract) {
        const { change } = await getValidatedData(request, ActivityValidator)
        const location = getLocation(request)

        // Clamp value between 0 and maxCapacity
        location.estimatedPeopleCount = Math.min(
            Math.max(0, location.estimatedPeopleCount + change),
            location.maxCapacity
        )

        await location.save()

        return location.toJSON()
    }

    public async open({ request }: HttpContextContract) {
        const location = await getLocation(request).setOpen()

        return location.toJSON()
    }

    public async close({ request }: HttpContextContract) {
        const location = await getLocation(request).setClosed()

        return location.toJSON()
    }
}
