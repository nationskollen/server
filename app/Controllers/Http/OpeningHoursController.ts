import { OpeningHourTypes } from 'App/Utils/Time'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import InternalErrorException from 'App/Exceptions/InternalErrorException'
import NationOpeningHourValidator from 'App/Validators/NationOpeningHourValidator'

export default class OpeningHoursController {
    public async create({ request }: HttpContextContract) {
        const data = await request.validate(NationOpeningHourValidator)
        const { nation } = request

        if (!nation) {
            throw new InternalErrorException('Could not find nation to update opening hours of')
        }

        const relation =
            data.type === OpeningHourTypes.Default ? 'openingHours' : 'openingHourExceptions'

        // TODO: Remove opening hour if it already exists for the selected day/day_special
        const model = await nation.related(relation).create(data)

        return model.toJSON()
    }
}
