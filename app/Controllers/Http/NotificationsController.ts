/**
 * Implements the endpoints that handles notifications
 *
 * @category Controller
 * @module NotificationsController
 */
import { getNotification } from 'App/Utils/Request'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NotificationsController {
    public async index({ request }: HttpContextContract) {
        return getNotification(request).toJSON()
    }
}
