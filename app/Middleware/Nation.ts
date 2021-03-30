import Nation from 'App/Models/Nation'
import NotFoundException from 'App/Exceptions/NotFoundException'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

// Verifies that the id param of a route is a valid oid of a student nation
export default class NationMiddleware {
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const nation = await Nation.findBy('oid', params.id)

        if (!nation) {
            throw new NotFoundException(`Could not find student nation with id: ${params.id}`)
        }

        request.nation = nation
        await next()
    }
}
