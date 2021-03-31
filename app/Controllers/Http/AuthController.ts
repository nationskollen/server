import UserValidator from 'App/Validators/UserValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { NationOwnerScopes } from 'App/Utils/Scopes'

export default class AuthController {
    public async login({ request, auth }: HttpContextContract) {
        const { email, password } = await request.validate(UserValidator)

        const token = await auth.use('api').attempt(email, password)
        let scope: string = NationOwnerScopes.None

        // Set scope depending on what user is
        // If nationId is not part of a nation (-1),
        // then return None.
        if (auth.user && auth.user.nationId > -1) {
            if (auth.user.nationAdmin) {
                scope = NationOwnerScopes.Admin
            } else {
                scope = NationOwnerScopes.Staff
            }
        }

        return {
            ...token.toJSON(),
            scope,
        }
    }
}
