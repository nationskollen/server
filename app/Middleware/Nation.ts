import Nation from 'App/Models/Nation'
import Logger from '@ioc:Adonis/Core/Logger'
import NotFoundException from 'App/Exceptions/NotFoundException'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import InternalErrorException from 'App/Exceptions/InternalErrorException'

export enum NationOwnerScopes {
    Guest = 'guest',
    Staff = 'staff',
    Admin = 'admin',
}

// Verifies that the id param of a route is a valid oid of a student nation
export default class NationMiddleware {
    private unauthorized() {
        throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS')
    }

    private invalidScope() {
        throw new InternalErrorException('Could not verify authentication scopes')
    }

    private verifyAuthenticationScope(scopes: string[], adminUserId: number, userId?: number) {
        if (scopes.length == 0) {
            return
        }

        if (scopes.length > 1) {
            Logger.error('Nation middleware only allows a single scope')
            this.invalidScope()
        }

        // We are missing the 'auth' middleware, but we have defined a scope.
        // This is an error and must return an Unauthorized error, since we
        // can not verify the scope of a non-authenticated request.
        if (!userId) {
            this.unauthorized()
        }

        // Get the selected scope
        const scope = scopes[0]

        switch (scope) {
            case NationOwnerScopes.Admin:
                userId !== adminUserId && this.unauthorized()
                break
            default:
                Logger.error(`Invalid scope in "nation" middleware: ${scope}`)
                this.invalidScope()
        }
    }

    public async handle(
        { request, params, auth }: HttpContextContract,
        next: () => Promise<void>,
        scopes: string[]
    ) {
        // Make sure that auth middleware is active if we have specified
        // authentication scope
        if (!auth && scopes.length > 0) {
            Logger.error('"nation" must be preceeded by the "auth" middleware')
            this.invalidScope()
        }

        const nation = await Nation.findBy('oid', params.id)

        if (!nation) {
            throw new NotFoundException(`Could not find student nation with id: ${params.id}`)
        }

        request.nation = nation

        this.verifyAuthenticationScope(scopes, nation.adminUserId, auth.user?.id)

        await next()
    }
}
