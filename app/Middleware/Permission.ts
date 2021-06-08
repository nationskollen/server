/**
 * @category Middleware
 * @module NewsMiddleware
 *
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PermissionsNotFoundException from 'App/Exceptions/PermissionsNotFoundException'
import Permission from 'App/Models/Permission'

export default class PermissionMiddleware {
    /**
     * Handle request
     */
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const permission = await Permission.find(params.pid)

        if (!permission) {
            throw new PermissionsNotFoundException()
        }

        request.permission = permission

        await next()
    }
}
