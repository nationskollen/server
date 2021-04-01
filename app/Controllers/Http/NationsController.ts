import { queryNationAll } from 'App/Utils/Query'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import InternalErrorException from 'App/Exceptions/InternalErrorException'
import NationActivityValidator from 'App/Validators/NationActivityValidator'
import NationInformationValidator from 'App/Validators/NationInformationValidator'

export default class NationsController {
    public async index({}: HttpContextContract) {
        const nations = await queryNationAll()
        return nations
    }

    public async show({ request }: HttpContextContract) {
        return request.nation
    }

    public async update({ request }: HttpContextContract) {
        const changes = await request.validate(NationInformationValidator)
        const nation = request.nation

        // Make sure that there is updated data from the request
        if (Object.keys(changes).length === 0) {
            throw new BadRequestException(
                'Could not update nation since the data contained no valid properties'
            )
        }

        if (nation) {
            nation.merge(changes)
            await nation.save()
        } else {
            throw new InternalErrorException('Could not find nation to update')
        }

        return nation
    }

    public async updateActivity({ request }: HttpContextContract) {
        const { change } = await request.validate(NationActivityValidator)
        const { nation } = request

        if (nation) {
            const { maxCapacity, estimatedPeopleCount } = nation

            // Clamp value between 0 and maxCapacity
            nation.estimatedPeopleCount = Math.min(
                Math.max(0, estimatedPeopleCount + change),
                maxCapacity
            )

            await nation.save()
        } else {
            throw new InternalErrorException('Could not find nation to update')
        }

        return {
            estimated_people_count: nation.estimatedPeopleCount,
            activity_level: nation.activityLevel,
        }
    }

    public async close({ request }: HttpContextContract) {
        const { nation } = request

        if (nation) {
            nation.isOpen = false
            nation.activityLevel = 0
            nation.estimatedPeopleCount = 0
            await nation.save()
        } else {
            throw new InternalErrorException('Could not find nation to update')
        }

        return nation
    }

    public async open({ request }: HttpContextContract) {
        const { nation } = request

        // TODO CHECKING OPENING HOURS?
        if (nation) {
            nation.isOpen = true
            nation.activityLevel = 1
            nation.estimatedPeopleCount = 0
            await nation.save()
        } else {
            throw new InternalErrorException('Could not find nation to update')
        }

        return nation
    }
}
