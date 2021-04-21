/**
 * MenuItem middleware handles valid request made to the server and informs the
 * requester if the request is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - {@link MenuItemNotFoundException}
 *
 * > You must register this middleware inside
 *   `start/kernel.ts` file under the list of named middleware.
 *
 * @category Middleware
 * @module MenuItemsMiddleware
 *
 */

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MenuItemNotFoundException from 'App/Exceptions/MenuItemNotFoundException'
import MenuItem from 'App/Models/MenuItem'

export default class MenuItemsMiddleware {
    /**
     * Handle the request
     */
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const menuItem = await MenuItem.find(params.miid)

        if (!menuItem) {
            throw new MenuItemNotFoundException()
        }

        request.menuItem = menuItem

        await next()
    }
}
