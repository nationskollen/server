/**
 * Exceptions in this middleware are:
 *
 * - {@link SubscriptionNotFound}
 *
 * @category Middleware
 * @module SubscriptionMiddleware
 *
 */

import Subscription from 'App/Models/Subscription'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SubscriptionNotFoundException from 'App/Exceptions/SubscriptionNotFoundException'

export default class SubscriptionMiddleware {
    public async handle(
        { request, params }: HttpContextContract,
        next: () => Promise<void>,
        options: string[]
    ) {
        let subscription: Subscription | null

        if (options.includes('preload')) {
            subscription = await Subscription.query()
                .where('uuid', params.uuid)
                .preload('pushToken')
                .first()
        } else {
            subscription = await Subscription.findBy('uuid', params.uuid)
        }

        if (!subscription) {
            throw new SubscriptionNotFoundException()
        }

        request.subscription = subscription

        await next()
    }
}
