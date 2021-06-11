/**
 * User middleware handles valid request made to the server and informs the
 * requester if something is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - `UserNotFoundException`
 * - `UserNotPartOfNationException`
 * - `UserAlreadyNationAdminException`
 * - `UserNotAdminException`
 *
 * @category Middleware
 * @module UserMiddleware
 *
 */
import User from 'App/Models/User'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserNotFoundException from 'App/Exceptions/UserNotFoundException'
import UserNotPartOfNationException from 'App/Exceptions/UserNotPartOfNationException'
import UserAlreadyNationAdminException from 'App/Exceptions/UserAlreadyNationAdminException'
import UserNotAdminException from 'App/Exceptions/UserNotAdminException'

export default class UserMiddleware {
    public async handle({ request, params, auth }: HttpContextContract, next: () => Promise<void>) {
        if (!auth?.user?.nationAdmin) {
            throw new UserNotAdminException()
        }

        const user = await User.find(params.uid)
        if (!user) {
            throw new UserNotFoundException()
        }

        if (auth?.user?.nationId != user.nationId) {
            throw new UserNotPartOfNationException()
        }

        // Make sure that the requested action is not operated
        // onto an already existing nation admin
        if (user.nationAdmin) {
            throw new UserAlreadyNationAdminException()
        }

        request.user = user

        await next()
    }
}