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
import { Permissions } from 'App/Utils/Permissions'
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
    public async add({ bouncer, request }: HttpContextContract) {
        const { user, permissionType } = getPermissionData(request)
        await bouncer.authorize('permissionRights', Permissions.Permission, user.nationId)

        await user.related('permissions').create({
            permissionTypeId: permissionType?.id,
        })

        await user.preload('permissions')

        return user.toJSON()
    }

    /**
     * remove user(s) permission access right
     */
    public async remove({ bouncer, request }: HttpContextContract) {
        const { user, permission } = getPermissionData(request)
        await bouncer.authorize('permissionRights', Permissions.Permission, user.nationId)

        await permission?.delete()
    }
}
