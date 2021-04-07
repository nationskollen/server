import Menu from 'App/Models/Menu'
import MenuValidator from 'App/Validators/MenuValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MenuUpdateValidator from 'App/Validators/MenuUpdateValidator'
import { getLocation, getMenu, getValidatedData } from 'App/Utils/Request'

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
        const data = await getValidatedData(request, MenuValidator)
        const location = getLocation(request)

        // We need to explicitly set the nationId before saving it,
        // hence the following approach
        const menu = new Menu()
        menu.merge(data)
        menu.nationId = location.nationId

        await location.related('menus').save(menu)

        return menu.toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const data = await getValidatedData(request, MenuUpdateValidator)
        const menu = getMenu(request)

        menu.merge(data)
        await menu.save()

        return menu.toJSON()
    }

    public async delete({ request }: HttpContextContract) {
        await getMenu(request).delete()
    }
}
