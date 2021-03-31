import Nation from 'App/Models/Nation'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import InternalErrorException from 'App/Exceptions/InternalErrorException'
import NationInformationValidator from 'App/Validators/NationInformationValidator'

export default class NationsController {
    public async index({}: HttpContextContract) {
        const nations = await Nation.all()
        return nations
    }

    public async show({ request }: HttpContextContract) {
        return request.nation
    }

    public async update({ request }: HttpContextContract) {
        const changes = await request.validate(NationInformationValidator)
        const { nation } = request

        // Make sure that there is updated data from the request
        if (Object.keys(changes).length === 0) {
            throw new BadRequestException(
                'Could not update nation since the data contained no valid properties'
            )
        }

        if (nation) {
            // Extract the available properties that can be updated
            const columns = nation.toJSON()

            for (const [key, value] of Object.entries(changes)) {
                // Make sure that the change is a valid column
                if (!columns.hasOwnProperty(key)) {
                    throw new InternalErrorException(
                        'Invalid property received in NationInformationValidator'
                    )
                }

                // Update the local model
                nation[key] = value
            }

            // Save to database
            await nation.save()
        } else {
            throw new InternalErrorException('Could not find nation to update')
        }

        return nation
    }

    public async updateActivity({ request }: HttpContextContract) {
        const { nation } = request

        // TODO: Add validator for request data
        // TODO: Update nation activity
        // TODO: Return updated nation

        return nation
    }
}
