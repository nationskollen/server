import Nation from 'App/Models/Nation'
import { getNation, getValidatedData } from 'App/Utils/Request'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import InformationValidator from 'App/Validators/InformationValidator'

export default class NationsController {
    public async index({}: HttpContextContract) {
        const nations = await Nation.allWithLocations()

        return nations.map((nation: Nation) => nation.toJSON())
    }

    public async show({ request }: HttpContextContract) {
        return getNation(request).toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const changes = await getValidatedData(request, InformationValidator)
        const nation = getNation(request)

        nation.merge(changes)
        await nation.save()

        return nation.toJSON()
    }
}
