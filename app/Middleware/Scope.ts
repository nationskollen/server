import User from 'App/Models/User'
import { NationOwnerScopes } from 'App/Utils/Scopes'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import InternalErrorException from 'App/Exceptions/InternalErrorException'

// Verifies that the id param of a route is a valid oid of a student nation
export default class ScopeMiddleware {
    private throwUnauthorized() {
        throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS')
    }

    private isStaff(oid: number, { nationId }: User) {
        return oid === nationId
    }

    private isAdmin(oid: number, user: User) {
        return this.isStaff(oid, user) && user.nationAdmin
    }

    private async verifyScope(oid: number, user: User, scopes: string[]) {
        // Get the selected scope
        const scope = scopes[0]

        switch (scope) {
            case NationOwnerScopes.Admin:
                !this.isAdmin(oid, user) && this.throwUnauthorized()
                break
            case NationOwnerScopes.Staff:
                !this.isStaff(oid, user) && this.throwUnauthorized()
                break
            default:
                throw new InternalErrorException(`Invalid scope in "nation" middleware: ${scope}`)
        }
    }

    public async handle(
        { request, auth }: HttpContextContract,
        next: () => Promise<void>,
        scopes: string[]
    ) {
        let oid: number

        // Depending on the route, the oid will be extracted from different models
        if (request.nation) {
            oid = request.nation.oid
        } else if (request.location) {
            oid = request.location.nationId
        } else if (request.menu) {
            oid = request.menu.nationId
        } else if (request.event) {
            oid = request.event.nationId
        } else {
            // If the oid could not be determined, prevent access to the route (programmer error)
            throw new InternalErrorException(
                'Could not verify authentication scope. Missing "nation" or "location" middleware'
            )
        }

        // We are missing the 'auth' middleware, but we have defined a scope.
        // This is an error and must return an Unauthorized error, since we
        // can not verify the scope of a non-authenticated request.
        if (scopes.length > 0) {
            if (auth.user) {
                await this.verifyScope(oid, auth.user, scopes)
            } else {
                throw new InternalErrorException(
                    '"nation" must be preceeded by the "auth" middleware'
                )
            }
        } else if (scopes.length > 1) {
            throw new InternalErrorException('Nation middleware only allows a single scope')
        }

        await next()
    }
}
