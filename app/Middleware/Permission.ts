/**
 * Permission middleware handles valid request made to the server and informs the
 * requester if something is invalid.
 *
 * In this middleware, we make sure that the requested permission action is not
 * operated onto an already existing nation admin.
 *
 * Depending on what was invalid, an exception will be thrown.
 * Exceptions in this middleware are:
 *
 * - `UserNotPartOfNationException`
 * - `UserAlreadyNationAdminException`
 * - `UserAlreadyHasPermissionExceptionxception`
 * - `UserNoSuchPermissionTypeException`
 *
 * @category Middleware
 * @module PermissionMiddleware
 *
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { getValidatedData } from 'App/Utils/Request'
import PermissionValidator from 'App/Validators/PermissionValidator'
import User from 'App/Models/User'
import Permission from 'App/Models/Permission'
import PermissionType from 'App/Models/PermissionType'

import NotFoundException from 'App/Exceptions/NotFoundException'
import UserNotPartOfNationException from 'App/Exceptions/UserNotPartOfNationException'
import UserAlreadyNationAdminException from 'App/Exceptions/UserAlreadyNationAdminException'
import UserAlreadyHasPermissionException from 'App/Exceptions/UserAlreadyHasPermissionException'
import UserNoSuchPermissionTypeException from 'App/Exceptions/UserNoSuchPermissionTypeException'

export default class PermissionMiddleware {
    public async handle(
        { request, auth }: HttpContextContract,
        next: () => Promise<void>,
        options: string[]
    ) {
        // Make sure that the authorized user is a nation admin so that the
        // requested action can be performed.
        if (!auth?.user) {
            throw new NotFoundException('No authorized user.')
        }

        // Extract the data in the request message
        const data = await getValidatedData(request, PermissionValidator)
        const user = await User.findBy('id', data.user_id)

        // We only need to make sure that the user is part of the nation, the
        // validator will make sure that the specified user id exists in the
        // system.
        if (user?.nationId != auth.user.nationId) {
            throw new UserNotPartOfNationException()
        }

        // Make sure that the requested permission action is not operated
        // onto an already existing nation admin
        if (user.nationAdmin) {
            throw new UserAlreadyNationAdminException()
        }

        // Check if the user already has the permission or not
        const permission = await Permission.query()
            .where('user_id', user.id)
            .where('permission_type_id', data.permission_type_id)
            .first()

        if (permission && !options.includes('delete')) {
            throw new UserAlreadyHasPermissionException()
        }

        if (!permission && options.includes('delete')) {
            throw new UserNoSuchPermissionTypeException()
        }

        // extract the permission type model
        // No need to check wether the type exists or not, since earlier in the
        // validator, we check that if the user has a permission model
        // corresponding to a permission type.
        const permissionType = await PermissionType.findBy('id', data.permission_type_id)

        // Store the values in an object in the request contract
        request.permissionData = { user, permission, permissionType, options }

        await next()
    }
}
