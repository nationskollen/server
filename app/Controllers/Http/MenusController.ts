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
import { Permissions } from 'App/Utils/Permissions'
import MenuUpdateValidator from 'App/Validators/Menus/UpdateValidator'
import MenuUploadValidator from 'App/Validators/Menus/UploadValidator'
import MenuFilterValidator from 'App/Validators/Menus/FilterValidator'
import MenuCreateController from 'App/Validators/Menus/CreateValidator'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import { getLocation, getMenu, getValidatedData } from 'App/Utils/Request'

export default class MenusController {
    /**
     * Fetch all the menus in the system
     */
    public async index({ request }: HttpContextContract) {
        const { hidden } = await getValidatedData(request, MenuFilterValidator, true)
        const location = getLocation(request)
        const menus = await Menu.query()
            .where('location_id', location.id)
            .apply((scopes) => {
                scopes.showHidden(!!hidden)
            })

        return menus.map((menu) => menu.toJSON())
    }

    /**
     * Fetch a single menu from a location
     */
    public async single({ request }: HttpContextContract) {
        return getMenu(request).toJSON()
    }

    /**
     * Create a menu
     */
    public async create({ bouncer, request }: HttpContextContract) {
        const location = getLocation(request)
        await bouncer.authorize('permissions', Permissions.Menus, location.nationId)

        const data = await getValidatedData(request, MenuCreateController)

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
    public async update({ bouncer, request }: HttpContextContract) {
        const menu = getMenu(request)

        await bouncer.authorize('permissions', Permissions.Menus, menu.nationId)

        const data = await getValidatedData(request, MenuUpdateValidator)

        menu.merge(data)
        await menu.save()

        return menu.toJSON()
    }

    /**
     * Delete a menu
     */
    public async delete({ bouncer, request }: HttpContextContract) {
        const menu = getMenu(request)
        await bouncer.authorize('permissions', Permissions.Menus, menu.nationId)

        await menu.delete()
    }

    /**
     * Method to upload an image to a menu in the system
     */
    public async upload({ bouncer, request }: HttpContextContract) {
        const menu = getMenu(request)
        await bouncer.authorize('permissions', Permissions.Menus, menu.nationId)

        const { icon, cover } = await getValidatedData(request, MenuUploadValidator)
        const iconName = await attemptFileUpload(icon, true)
        const coverName = await attemptFileUpload(cover)

        if (iconName) {
            attemptFileRemoval(menu.iconImgSrc)
            menu.iconImgSrc = iconName
        }

        if (coverName) {
            attemptFileRemoval(menu.coverImgSrc)
            menu.coverImgSrc = coverName
        }

        // Update cover image
        await menu.save()

        return menu.toJSON()
    }
}
