import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { getValidatedData } from 'App/Utils/Request'
import PermissionValidator from 'App/Validators/PermissionValidator'
import User from 'App/Models/User'
import Permission from 'App/Models/Permission'
import PermissionType from 'App/Models/PermissionType'

import NotAdminException from 'App/Exceptions/NotAdminExecption'
import BadRequestException from 'App/Exceptions/BadRequestException'
import UserNotPartOfNationException from 'App/Exceptions/UserNotPartOfNationException'
import UserAlreadyNationAdminException from 'App/Exceptions/UserAlreadyNationAdminException'
import UserAlreadyHasPermissionException from 'App/Exceptions/UserAlreadyHasPermissionException'

export default class PermissionMiddleware {
    public async handle(
        { request, auth }: HttpContextContract,
        next: () => Promise<void>,
        options: string[]
    ) {
        // Make sure that the authorized user is a nation admin so that the
        // requested action can be performed.
        if (!auth?.user?.nationAdmin) {
            throw new NotAdminException()
        }

        if (!request) {
            throw new BadRequestException('Missing data in request')
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

        // Make sure that the requested permission action does is not operated
        // onto an already existing nation admin
        if (user.nationAdmin) {
            throw new UserAlreadyNationAdminException()
        }

        // Check if the user already has the permission or not
        const permission = await Permission.query()
            .where('user_id', user.id)
            .where('permission_type_id', data.permission)
            .first()

        if (permission && !options.includes('delete')) {
            throw new UserAlreadyHasPermissionException()
        }

        // extract the permission type model
        const permissionType = await PermissionType.findBy('id', data.permission)

        // Store the values in an object in the request contract
        request.permissionData = { user, permission, permissionType }
        await next()
    }
}
