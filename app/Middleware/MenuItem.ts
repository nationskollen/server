import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MenuItemNotFoundException from 'App/Exceptions/MenuItemNotFoundException'
import MenuItem from 'App/Models/MenuItem'

export default class MenuItemsMiddleware {
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const menuItem = await MenuItem.find(params.miid)

        if (!menuItem) {
            throw new MenuItemNotFoundException()
        }

        request.menuItem = menuItem

        await next()
    }
}
