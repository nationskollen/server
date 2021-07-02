/**
 * Auth controller is the module that has the functionality to perform
 * operations such as login and logging out a user from the server.
 *
 * @category Controller
 * @module AuthController
 */
import LoginValidator from 'App/Validators/Users/LoginValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserNotFoundException from 'App/Exceptions/UserNotFoundException'

export default class AuthController {
    /**
     * Logins a user to the server
     */
    public async login({ request, auth }: HttpContextContract) {
        const { email, password } = await request.validate(LoginValidator)
        const token = await auth.use('api').attempt(email, password)

        if (!auth.user) {
            throw new UserNotFoundException()
        }
        await auth.user.load('permissions')

        return {
            ...token.toJSON(),
            ...auth.user.toJSON(),
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
