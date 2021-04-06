import Location from 'App/Models/Location'
import ActivityValidator from 'App/Validators/ActivityValidator'
import LocationValidator from 'App/Validators/LocationValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getNation, getLocation, getValidatedData } from 'App/Utils/Request'

export default class LocationsController {
    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const locations = await Location.query().where('nationId', oid)

        return locations.map((location: Location) => location.toJSON())
    }

    public async single({ request }: HttpContextContract) {
        return getLocation(request).toJSON()
    }

    public async create({ request }: HttpContextContract) {
        // TODO: Create locations
    }

    public async update({ request, response }: HttpContextContract) {
        const changes = await getValidatedData(request, LocationValidator)

        return response.status(501)
    }

    public async delete({ request }: HttpContextContract) {
        // TODO: Delete locations
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
