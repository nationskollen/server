import Menu from 'App/Models/Menu'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MenuItemUpdateValidator from 'App/Validators/MenuItems/UpdateValidator'
import MenuItemCreateValidator from 'App/Validators/MenuItems/CreateValidator'
import { getLocation, getMenu, getMenuItem, getValidatedData } from 'App/Utils/Request'

export default class MenuItemsController {
    public async index({ request }: HttpContextContract) {
        const location = getLocation(request)
        const menus = await Menu.allWithItems(location.id)

        return menus.map((menu) => menu.toJSON())
    }

    public async single({ request }: HttpContextContract) {
        return getMenu(request).toJSON()
    }

    public async create({ request }: HttpContextContract) {
        const data = await getValidatedData(request, MenuItemCreateValidator)
        const menu = getMenu(request)
        const newMenu = await menu.related('items').create(data)

        return newMenu.toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const data = await getValidatedData(request, MenuItemUpdateValidator)
        const menuItem = getMenuItem(request)

        menuItem.merge(data)
        await menuItem.save()

        return menuItem.toJSON()
    }

    public async delete({ request }: HttpContextContract) {
        await getMenuItem(request).delete()
    }
}
