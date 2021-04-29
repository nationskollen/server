/**
 * Exceptions in this middleware are:
 *
 * - {@link NotificationNotFoundException}
 *
 * @category Middleware
 * @module NotifactionMiddleware
 *
 */

import Notification from 'App/Models/Notification'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotificationNotFoundException from 'App/Exceptions/NotificationNotFoundException'

export default class NotifactionMiddleware {
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        let notification: Notification | null

        notification = await Notification.findBy('id', params.nid)

        if (!notification) {
            throw new NotificationNotFoundException()
        }

        request.notification = notification

        await next()
    }
}
