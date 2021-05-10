/**
 * Menu middleware handles valid request made to the server and informs the
 * requester if something is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - `MenuNotFoundException`
 *
 * > You must register this middleware inside
 *   `start/kernel.ts` file under the list of named middleware.
 *
 * @category Middleware
 * @module MenuMiddleware
 *
 */
import Menu from 'App/Models/Menu'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MenuNotFoundException from 'App/Exceptions/MenuNotFoundException'

export default class MenuMiddleware {
    /**
     * Handle request
     */
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        let menu: Menu | null

        menu = await Menu.find(params.mid)

        if (!menu) {
            throw new MenuNotFoundException()
        }

        request.menu = menu

        await next()
    }
}
