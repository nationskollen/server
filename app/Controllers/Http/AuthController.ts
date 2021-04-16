import { NationOwnerScopes } from 'App/Utils/Scopes'
import LoginValidator from 'App/Validators/Users/LoginValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
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

    public async logout({ auth }: HttpContextContract) {
        await auth.use('api').logout()
    }
}
