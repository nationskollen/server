/**
 * Implements the endpoints that allow users to subscribe and
 * unsubscribe to topics of a student nation.
 *
 * @category Controller
 * @module SubscriptionsController
 */
import PushToken from 'App/Models/PushToken'
import Subscription from 'App/Models/Subscription'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getSubscription, getValidatedData } from 'App/Utils/Request'
import PushTokenNotFoundException from 'App/Exceptions/PushTokenNotFoundException'
import SubscriptionQueryValidator from 'App/Validators/Subscriptions/QueryValidator'
import SubscriptionCreateValidator from 'App/Validators/Subscriptions/CreateValidator'

export default class SubscriptionsController {
    /**
     * Fetch all the available {@link SubscriptionTopic|subscription topics}
     */
    public async topics(_: HttpContextContract) {
        const topics = await SubscriptionTopic.all()
        return topics.map((topic) => topic.toJSON())
    }

    /**
     * Fetch all the subscriptions for a {@link PushToken|push token}
     */
    public async single({ request }: HttpContextContract) {
        const query = await getValidatedData(request, SubscriptionQueryValidator)
        const pushToken = await PushToken.findBy('token', query.token)

        if (!pushToken) {
            throw new PushTokenNotFoundException()
        }

        const subscriptions = await Subscription.query().where('pushTokenId', pushToken.id)

        return subscriptions.map((subscription) => subscription.toJSON())
    }

    /**
     * Creates a subscription to a topic for a {@link PushToken|push token}
     */
    public async create({ request }: HttpContextContract) {
        const { oid, topic, token } = await getValidatedData(request, SubscriptionCreateValidator)
        const pushToken = await PushToken.firstOrCreate({ token })
        const subscription = await Subscription.firstOrCreate({
            nationId: oid,
            pushTokenId: pushToken.id,
            subscriptionTopicId: topic,
        })

        return subscription.toJSON()
    }

    /**
     * Deletes a subscription to a topic for a {@link PushToken|push token}
     */
    public async delete({ request }: HttpContextContract) {
        const subscription = getSubscription(request)
        await subscription.delete()
    }
}
