/**
 * The MenusController contains all the methods that are available to perform
 * on {@link Menu | menu models} in the system.
 *
 * Only an admin of a nation can perform the given operations on its own nation.
 *
 *
 * @category Controller
 * @module MenusController
 */
import Menu from 'App/Models/Menu'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MenuUpdateValidator from 'App/Validators/Menus/UpdateValidator'
import MenuCreateController from 'App/Validators/Menus/CreateValidator'
import { getLocation, getMenu, getValidatedData } from 'App/Utils/Request'

export default class MenusController {
    /**
     * Fetch all the menus (and their items) in the system
     */
    public async index({ request }: HttpContextContract) {
        const location = getLocation(request)
        const menus = await Menu.allMenus(location.id)

        return menus.map((menu) => menu.toJSON())
    }

    /**
     * Fetch all the menus in the system
     */
    public async withItems({ request }: HttpContextContract) {
        const location = getLocation(request)
        const menus = await Menu.allMenus(location.id)

        return menus.map((menu) => menu.toJSON())
    }

    /**
     * Fetch a single menu from a location
     */
    public async single({ request }: HttpContextContract) {
        return getMenu(request).toJSON()
    }

    /**
     * Creat a menu
     */
    public async create({ request }: HttpContextContract) {
        const data = await getValidatedData(request, MenuCreateController)
        const location = getLocation(request)

        // We need to explicitly set the nationId before saving it,
        // hence the following approach
        const menu = new Menu()
        menu.merge(data)
        menu.nationId = location.nationId

        await location.related('menus').save(menu)

        return menu.toJSON()
    }

    /**
     * Update a menu
     */
    public async update({ request }: HttpContextContract) {
        const data = await getValidatedData(request, MenuUpdateValidator)
        const menu = getMenu(request)

        menu.merge(data)
        await menu.save()

        return menu.toJSON()
    }

    /**
     * Delete a menu
     */
    public async delete({ request }: HttpContextContract) {
        await getMenu(request).delete()
    }
}
