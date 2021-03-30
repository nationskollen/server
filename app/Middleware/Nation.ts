import Nation from 'App/Models/Nation'
import NotFoundException from 'App/Exceptions/NotFoundException'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'

export enum NationOwnerScopes {
    Guest = 'guest',
    Staff = 'staff',
    Admin = 'admin',
}

// Verifies that the id param of a route is a valid oid of a student nation
export default class NationMiddleware {
    public async handle(
        { request, params, auth }: HttpContextContract,
        next: () => Promise<void>,
        scope: string[]
    ) {
        // TODO: Add check for valid scopes

        const nation = await Nation.findBy('oid', params.id)

        if (!nation) {
            throw new NotFoundException(`Could not find student nation with id: ${params.id}`)
        }

        request.nation = nation

        if (scope.includes(NationOwnerScopes.Admin)) {
            if (auth?.user?.id !== nation.adminUserId) {
                throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS')
            }
        }

        await next()
    }
}
