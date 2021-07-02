/**
 * Auth controller is the module that has the functionality to perform
 * operations such as login and logging out a user from the server.
 *
 * @category Controller
 * @module AuthController
 */
import LoginValidator from 'App/Validators/Users/LoginValidator'
import Permission from 'App/Models/Permission'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
    /**
     * Logins a user to the server
     */
    public async login({ request, auth }: HttpContextContract) {
        const { email, password } = await request.validate(LoginValidator)
        const token = await auth.use('api').attempt(email, password)

        let oid = -1
        let admin = false
        let permissions: Array<Permission> = []

        // If nationId is not part of a nation (-1),
        // as well load the permissions that exists for the user
        // then return None.
        if (auth.user && auth.user.nationId > -1) {
            oid = auth.user.nationId
            await auth.user.load('permissions')
            permissions = auth.user.permissions
            admin = auth.user.nationAdmin
        }

        return {
            ...token.toJSON(),
            permissions,
            admin,
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
