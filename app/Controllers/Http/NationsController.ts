import Nation from 'App/Models/Nation'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NationsController {
    public async index({}: HttpContextContract) {
        const nations = await Nation.all()
        return nations
    }

    public async show({ request }: HttpContextContract) {
        return request.nation
    }

    public async update({ request }: HttpContextContract) {
        const { nation } = request

        // TODO: Add validator for request data
        // TODO: Update nation
        // TODO: Return updated nation
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
