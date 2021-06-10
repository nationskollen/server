/**
 * The PermissionTypesController contains all the methods that are available to
 * perform on {@link PermissionType | PermissionType- } and {@link Permission |
 * Permissions models} in the system.
 *
 * For now, its only a hook for fetching the available categories in the system
 *
 *
 * @category Controller
 * @module Permissions
 */
import PermissionType from 'App/Models/PermissionType'

// import PermissionValidator from 'App/Validators/PermissionValidator'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getPermissionData } from 'App/Utils/Request'

export default class PermissionsController {
    /**
     * fetch all permission types from system
     */
    public async index({}: HttpContextContract) {
        const permissions = await PermissionType.query().apply((scopes) => {
            scopes.inOrder()
        })

        return permissions.map((permission: PermissionType) => permission.toJSON())
    }

    /**
     *
     * add user(s) permission access right
     */
    public async add({ request }: HttpContextContract) {
        const { user, permissionType } = getPermissionData(request)

        await user.related('permissions').create({
            permissionTypeId: permissionType?.id,
        })

        return user.toJSON()
    }

    /**
     * remove user(s) permission access right
     */
    public async remove({ request }: HttpContextContract) {
        const { permission } = getPermissionData(request)
        await permission?.delete()
    }
}
