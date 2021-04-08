import MenuItem from 'App/Models/MenuItem'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import { getMenu, getMenuItem, getValidatedData } from 'App/Utils/Request'
import MenuItemUpdateValidator from 'App/Validators/MenuItems/UpdateValidator'
import MenuItemCreateValidator from 'App/Validators/MenuItems/CreateValidator'
import MenuItemUploadValidator from 'App/Validators/MenuItems/UploadValidator'

export default class MenuItemsController {
    public async index({ request }: HttpContextContract) {
        const menu = getMenu(request)
        const items = await MenuItem.query().where('menu_id', menu.id)

        return items.map((item) => item.toJSON())
    }

    public async single({ request }: HttpContextContract) {
        return getMenuItem(request).toJSON()
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

    public async upload({ request }: HttpContextContract) {
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
