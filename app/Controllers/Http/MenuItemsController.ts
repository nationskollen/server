/**
 * The MenuItemsController contains all the methods that are available to perform
 * on {@link MenuItem | menu item models} in the system.
 *
 * Only an admin of a nation can perform the given operations on its own nation.
 *
 * @category Controller
 * @module MenuItemsController
 */
import MenuItem from 'App/Models/MenuItem'
import { getPageNumber } from 'App/Utils/Paginate'
import { Permissions } from 'App/Utils/Permissions'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PaginationValidator from 'App/Validators/PaginationValidator'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import { getMenu, getMenuItem, getValidatedData } from 'App/Utils/Request'
import MenuItemUpdateValidator from 'App/Validators/MenuItems/UpdateValidator'
import MenuItemCreateValidator from 'App/Validators/MenuItems/CreateValidator'
import MenuItemUploadValidator from 'App/Validators/MenuItems/UploadValidator'

export default class MenuItemsController {
    /**
     * Fetch all menu items in a menu
     */
    public async index({ request }: HttpContextContract) {
        const menu = getMenu(request)
        const specified = await getValidatedData(request, PaginationValidator, true)

        const query = MenuItem.query().where('menu_id', menu.id)
        const menuItems = await query.paginate(getPageNumber(specified.page), specified.amount)

        return menuItems.toJSON()
    }

    /**
     * Fetch a single menu item
     */
    public async single({ request }: HttpContextContract) {
        return getMenuItem(request).toJSON()
    }

    /**
     * create a menu item
     */
    public async create({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.MenuItem)

        const data = await getValidatedData(request, MenuItemCreateValidator)
        const menu = getMenu(request)
        const newMenu = await menu.related('items').create(data)

        return newMenu.toJSON()
    }

    /**
     * update a menu item
     */
    public async update({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.MenuItem)

        const data = await getValidatedData(request, MenuItemUpdateValidator)
        const menuItem = getMenuItem(request)

        menuItem.merge(data)
        await menuItem.save()

        return menuItem.toJSON()
    }

    /**
     * delete a menu item
     */
    public async delete({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.MenuItem)

        await getMenuItem(request).delete()
    }

    /**
     * upload a file to a menu item
     */
    public async upload({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.MenuItem)

        const menuItem = getMenuItem(request)
        const { cover } = await getValidatedData(request, MenuItemUploadValidator)
        const filename = await attemptFileUpload(cover)

        if (filename) {
            attemptFileRemoval(menuItem.coverImgSrc)
            menuItem.coverImgSrc = filename
        }

        // Update cover image
        await menuItem.save()

        return menuItem.toJSON()
    }
}
