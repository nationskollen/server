/**
 * Defines a Subscription for a push token of a student nation and topic.
 * This model is used to keep track of every subscription type that a push
 * token has subscribed to. It is nation-specific, i.e. there will be one entry
 * for each nation and subscription type that the user subscribes to.
 *
 * @category Model
 * @module Subscription
 */
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import Nation from 'App/Models/Nation'
import PushToken from 'App/Models/PushToken'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'
import { BaseModel, column, belongsTo, BelongsTo, beforeCreate } from '@ioc:Adonis/Lucid/Orm'

export default class Subscription extends BaseModel {
    public static async forToken(token: string) {
        const pushToken = await PushToken.findBy('token', token)

        if (!pushToken) {
            return null
        }

        const subscriptions = await Subscription.query().where('pushTokenId', pushToken.id)
        return subscriptions
    }

    @column({ isPrimary: true })
    public id: number

    /**
     * Unique access key that is used to send requests that requires "authentication"
     */
    @column()
    public uuid: string

    /**
     * Id of the nation that is subscribed to
     */
    @column()
    public nationId: number

    /**
     * Id of the push token that this subscription belongs to
     */
    @column({ serializeAs: null })
    public pushTokenId: number

    /**
     * Id of the subscription topic that is subscribed to
     */
    @column()
    public subscriptionTopicId: number

    @belongsTo(() => Nation, { localKey: 'oid' })
    public nation: BelongsTo<typeof Nation>

    @belongsTo(() => PushToken)
    public pushToken: BelongsTo<typeof PushToken>

    @belongsTo(() => SubscriptionTopic)
    public subscriptionTopic: BelongsTo<typeof SubscriptionTopic>

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    /**
     * Generate a unique id for the subscription that will serve
     * as a "secret" key for managing your subscription.
     */
    @beforeCreate()
    public static async createAccessKey(subscription: Subscription) {
        subscription.uuid = uuidv4()
    }
}
