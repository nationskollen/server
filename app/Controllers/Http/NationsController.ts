import Nation from 'App/Models/Nation'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NationsController {
    public async all({ request }: HttpContextContract) {
        const nations = await Nation.all()
        return nations
    }
}
