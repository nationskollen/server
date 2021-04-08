import Location from 'App/Models/Location'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import ActivityValidator from 'App/Validators/Locations/ActivityValidator'
import { getNation, getLocation, getValidatedData } from 'App/Utils/Request'
import LocationUpdateValidator from 'App/Validators/Locations/UpdateValidator'
import LocationCreateValidator from 'App/Validators/Locations/CreateValidator'
import LocationUploadValidator from 'App/Validators/Locations/UploadValidator'

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
        const nation = getNation(request)
        const data = await getValidatedData(request, LocationCreateValidator)
        const location = await nation.related('locations').create(data)

        return location.toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const location = getLocation(request)
        const changes = await getValidatedData(request, LocationUpdateValidator)

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
        const location = getLocation(request)
        const { change } = await getValidatedData(request, ActivityValidator)

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
