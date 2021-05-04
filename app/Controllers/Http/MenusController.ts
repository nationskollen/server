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
import { ExtractScopes } from '@ioc:Adonis/Lucid/Model'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MenuUpdateValidator from 'App/Validators/Menus/UpdateValidator'
import MenuUploadValidator from 'App/Validators/Menus/UploadValidator'
import MenuFilterValidator from 'App/Validators/Menus/FilterValidator'
import MenuCreateController from 'App/Validators/Menus/CreateValidator'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import { getLocation, getMenu, getValidatedData } from 'App/Utils/Request'

export default class MenusController {
    /**
     * Method that applies given filters depedning on what type of menu to
     * filter after
     * @param scopes - The different scopes that exists in the system
     * @param filters - The filter to apply
     */
    private applyFilters(scopes: ExtractScopes<typeof Menu>, filters: boolean | undefined) {
        if (filters) {
            // Filter based on selected date
            scopes.showHidden(filters)
        } else {
            scopes.showHidden(!!filters)
        }
    }

    /**
     * Fetch all the menus in the system
     */
    public async index({ request }: HttpContextContract) {
        const { hidden } = await getValidatedData(request, MenuFilterValidator, true)
        const location = getLocation(request)
        const menus = await Menu.query()
            .where('location_id', location.id)
            .apply((scopes) => {
                this.applyFilters(scopes, hidden)
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

    /**
     * Method to upload an image to a menu in the system
     */
    public async upload({ request }: HttpContextContract) {
        const menu = getMenu(request)
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
