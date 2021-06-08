import Permission from 'App/Models/Permission'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PermissionsController {
    /**
     * fetch all permission groups from system
     */
    public async all({}: HttpContextContract) {
        const permissions = await Permission.query()

        return permissions.map((permission: Permission) => permission.toJSON())
    }
}
