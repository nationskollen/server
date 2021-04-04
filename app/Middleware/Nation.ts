import User from 'App/Models/User'
import Nation from 'App/Models/Nation'
import { NationOwnerScopes } from 'App/Utils/Scopes'
import NotFoundException from 'App/Exceptions/NotFoundException'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import InternalErrorException from 'App/Exceptions/InternalErrorException'

// Verifies that the id param of a route is a valid oid of a student nation
export default class NationMiddleware {
    private throwUnauthorized() {
        throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS')
    }

    private isStaff({ oid }: Nation, { nationId }: User) {
        return oid === nationId
    }

    private isAdmin(nation: Nation, user: User) {
        return this.isStaff(nation, user) && user.nationAdmin
    }

    private async verifyAuthenticationScope(nation: Nation, user: User, scopes: string[]) {
        // Get the selected scope
        const scope = scopes[0]

        switch (scope) {
            case NationOwnerScopes.Admin:
                !this.isAdmin(nation, user) && this.throwUnauthorized()
                break
            case NationOwnerScopes.Staff:
                !this.isStaff(nation, user) && this.throwUnauthorized()
                break
            default:
                throw new InternalErrorException(`Invalid scope in "nation" middleware: ${scope}`)
        }
    }

    public async handle(
        { request, params, auth }: HttpContextContract,
        next: () => Promise<void>,
        scopes: string[]
    ) {
        const nation = await Nation.withLocations(params.id)

        if (!nation) {
            throw new NotFoundException(`Could not find student nation with id: ${params.id}`)
        }

        request.nation = nation

        // We are missing the 'auth' middleware, but we have defined a scope.
        // This is an error and must return an Unauthorized error, since we
        // can not verify the scope of a non-authenticated request.
        if (scopes.length > 0) {
            if (auth.user) {
                await this.verifyAuthenticationScope(nation, auth.user, scopes)
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
