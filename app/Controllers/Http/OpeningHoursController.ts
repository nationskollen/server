import OpeningHour from 'App/Models/OpeningHour'
import { OpeningHourTypes } from 'App/Utils/Time'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import OpeningHourValidator from 'App/Validators/OpeningHourValidator'
import InternalErrorException from 'App/Exceptions/InternalErrorException'
import OpeningHourUpdateValidator from 'App/Validators/OpeningHourUpdateValidator'

export default class OpeningHoursController {
    public async create({ request }: HttpContextContract) {
        const data = await request.validate(OpeningHourValidator)
        const { nation } = request

        if (!nation) {
            throw new InternalErrorException('Could not find nation to create opening hours for')
        }

        const relation =
            data.type === OpeningHourTypes.Default ? 'openingHours' : 'openingHourExceptions'

        // TODO: Remove opening hour if it already exists for the selected day/day_special?
        const model = await nation.related(relation).create(data)

        return model.toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const changes = await request.validate(OpeningHourUpdateValidator)
        const { nation, openingHour } = request

        // Make sure that there is updated data from the request
        if (Object.keys(changes).length === 0) {
            throw new BadRequestException(
                'Could not update opening hour since the data contained no valid properties'
            )
        }

        if (!nation) {
            throw new InternalErrorException('Could not find nation to update opening hours of')
        }

        if (!openingHour) {
            throw new InternalErrorException('Could not find opening hour to update')
        }

        openingHour.merge(changes)
        await openingHour.save()

        return openingHour.toJSON()
    }

    public async delete({ request }: HttpContextContract) {
        const { nation, openingHour } = request

        if (!nation) {
            throw new InternalErrorException('Could not find nation to update opening hours of')
        }

        if (!openingHour) {
            throw new InternalErrorException('Could not find opening hour to update')
        }

        await openingHour.delete()

        // Return nothing
        return
    }
}
