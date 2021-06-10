/**
 * The PermissionTypesController contains all the methods that are available to
 * perform on {@link PermissionType | PermissionType models} in the system.
 *
 * For now, its only a hook for fetching the available categories in the system
 *
 *
 * @category Controller
 * @module PermissionType
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PermissionType from 'App/Models/PermissionType'

export default class PermissionTypesController {
    /**
     * fetch all permission types from system
     */
    public async index({}: HttpContextContract) {
        const permissions = await PermissionType.query().apply((scopes) => {
            scopes.inOrder()
        })

        return permissions.map((permission: PermissionType) => permission.toJSON())
    }
}
