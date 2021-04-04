import Nation from 'App/Models/Nation'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import InternalErrorException from 'App/Exceptions/InternalErrorException'
import ActivityValidator from 'App/Validators/ActivityValidator'
import InformationValidator from 'App/Validators/InformationValidator'

export default class NationsController {
    public async index({}: HttpContextContract) {
        const nations = await Nation.allWithLocations()
        return nations.map((nation: Nation) => nation.toJSON())
    }

    public async show({ request }: HttpContextContract) {
        const { nation } = request

        if (!nation) {
            throw new InternalErrorException('Could not find nation')
        }

        return nation.toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const changes = await request.validate(InformationValidator)
        const { nation } = request

        // Make sure that there is updated data from the request
        if (Object.keys(changes).length === 0) {
            throw new BadRequestException(
                'Could not update nation since the data contained no valid properties'
            )
        }

        if (!nation) {
            throw new InternalErrorException('Could not find nation to update')
        }

        nation.merge(changes)
        await nation.save()

        return nation.toJSON()
    }

    public async updateActivity({ request }: HttpContextContract) {
        const { change } = await request.validate(ActivityValidator)
        const { nation } = request

        if (!nation) {
            throw new InternalErrorException('Could not find nation to update')
        }

        const { maxCapacity, estimatedPeopleCount } = nation

        // Clamp value between 0 and maxCapacity
        nation.estimatedPeopleCount = Math.min(
            Math.max(0, estimatedPeopleCount + change),
            maxCapacity
        )

        await nation.save()

        return {
            estimated_people_count: nation.estimatedPeopleCount,
            activity_level: nation.activityLevel,
        }
    }

    public async close({ request }: HttpContextContract) {
        const { nation } = request

        if (!nation) {
            throw new InternalErrorException('Could not find nation to set to closed')
        }

        nation.isOpen = false
        nation.activityLevel = 0
        nation.estimatedPeopleCount = 0
        await nation.save()

        return nation
    }

    public async open({ request }: HttpContextContract) {
        const { nation } = request

        if (!nation) {
            throw new InternalErrorException('Could not find nation to set to open')
        }

        nation.isOpen = true
        nation.activityLevel = 1
        nation.estimatedPeopleCount = 0
        await nation.save()

        return nation
    }
}
