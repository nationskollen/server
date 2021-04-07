import Menu from 'App/Models/Menu'
import { getLocation, getMenu } from 'App/Utils/Request'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MenusController {
    public async index({ request }: HttpContextContract) {
        const location = getLocation(request)
        const menus = await Menu.allWithItems(location.id)

        return menus.map((menu) => menu.toJSON())
    }

    public async single({ request }: HttpContextContract) {
        return getMenu(request).toJSON()
    }

    public async create({ request }: HttpContextContract) {
    }

    public async update({ request }: HttpContextContract) {
    }

    public async delete({ request }: HttpContextContract) {
    }
}
