import Nation from 'App/Models/Nation'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NationNotFoundException from 'App/Exceptions/NationNotFoundException'

// Verifies that the id param of a route is a valid oid of a student nation
export default class NationMiddleware {
    public async handle(
        { request, params }: HttpContextContract,
        next: () => Promise<void>,
        options: string[]
    ) {
        let nation: Nation | null

        if (options.includes('preload')) {
            nation = await Nation.withLocations(params.id)
        } else {
            nation = await Nation.findBy('oid', params.id)
        }

        if (!nation) {
            throw new NationNotFoundException()
        }

        request.nation = nation

        await next()
    }
}
