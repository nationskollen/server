/**
 * Auth controller is the module that has the functionality to perform
 * operations such as login and logging out a user from the server.
 *
 * @category Controller
 * @module AuthController
 */
import { NationOwnerScopes } from 'App/Utils/Scopes'
import LoginValidator from 'App/Validators/Users/LoginValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
    /**
     * Logins a user to the server
     */
    public async login({ request, auth }: HttpContextContract) {
        const { email, password } = await request.validate(LoginValidator)
        const token = await auth.use('api').attempt(email, password)

        let scope = NationOwnerScopes.None
        let oid = -1

        // Set scope depending on what user is
        // If nationId is not part of a nation (-1),
        // then return None.
        if (auth.user && auth.user.nationId > -1) {
            if (auth.user.nationAdmin) {
                scope = NationOwnerScopes.Admin
            } else {
                scope = NationOwnerScopes.Staff
            }

            oid = auth.user.nationId
        }

        return {
            ...token.toJSON(),
            scope,
            oid,
        }
    }

    /**
     * logs out a user from the server
     * Can only be run if a user is logged in.
     * The {@link Route | route} is not accessible if no user is logged in.
     */
    public async logout({ auth }: HttpContextContract) {
        await auth.use('api').logout()
    }
}
