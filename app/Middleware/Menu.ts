import Menu from 'App/Models/Menu'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MenuNotFoundException from 'App/Exceptions/MenuNotFoundException'

export default class MenuMiddleware {
    public async handle(
        { request, params }: HttpContextContract,
        next: () => Promise<void>,
        options: string[]
    ) {
        let menu: Menu | null

        if (options.includes('preload')) {
            menu = await Menu.withItems(params.mid)
        } else {
            menu = await Menu.find(params.mid)
        }

        if (!menu) {
            throw new MenuNotFoundException()
        }

        request.menu = menu

        await next()
    }
}
