import { OpeningHourTypes } from 'App/Utils/Time'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OpeningHourValidator from 'App/Validators/OpeningHourValidator'
import { getLocation, getOpeningHour, getValidatedData } from 'App/Utils/Request'
import OpeningHourUpdateValidator from 'App/Validators/OpeningHourUpdateValidator'

export default class OpeningHoursController {
    public async create({ request }: HttpContextContract) {
        const data = await getValidatedData(request, OpeningHourValidator)
        const location = getLocation(request)

        const relation =
            data.type === OpeningHourTypes.Default ? 'openingHours' : 'openingHourExceptions'

        // TODO: Remove opening hour if it already exists for the selected day/day_special?
        const model = await location.related(relation).create(data)

        return model.toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const changes = await getValidatedData(request, OpeningHourUpdateValidator)
        const openingHour = getOpeningHour(request)

        openingHour.merge(changes)
        await openingHour.save()

        return openingHour.toJSON()
    }

    public async delete({ request }: HttpContextContract) {
        await getOpeningHour(request).delete()

        // TODO: Set correct response code, e.g. 204
        return
    }
}
