/**
 * Implements the endpoints that handles notifications
 *
 * @category Controller
 * @module NotificationsController
 */
import { DateTime } from 'luxon'
import { getPageNumber } from 'App/Utils/Paginate'
import Notification from 'App/Models/Notification'
import { getNotification, getValidatedData } from 'App/Utils/Request'
import { ExtractScopes } from '@ioc:Adonis/Lucid/Model'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotificationFilterValidator from 'App/Validators/Notifications/FilterValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'

export default class NotificationsController {
    /**
     * Method that applies given filters to notifications
     *
     * @param scopes - The different scopes that exists in the system
     * @param filters - The filter to apply
     */
    private applyFilters(
        scopes: ExtractScopes<typeof Notification>,
        filters: Record<string, DateTime | undefined>
    ) {
        if (filters.after) {
            // Filter based on when the event start, i.e. all events after a
            // certain date
            scopes.afterDate(filters.after)
        }

        // Order events based on the 'created_at' field
        scopes.inOrder()
    }

    /**
     * Method to retrieve all the notifications in the system
     * The actual function call is done by a request (CRUD) which are specified
     * in `Routes.ts`
     */
    public async all({ request }: HttpContextContract) {
        const { after } = await getValidatedData(request, NotificationFilterValidator, true)
        const specified = await getValidatedData(request, PaginationValidator, true)

        const query = Notification.query().apply((scopes) => {
            this.applyFilters(scopes, { after })
        })

        const notifications = await query.paginate(getPageNumber(specified.page), specified.amount)
        return notifications.toJSON()
    }

    public async index({ request }: HttpContextContract) {
        return getNotification(request).toJSON()
    }
}
