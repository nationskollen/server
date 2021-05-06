/**
 * Defines a subscription type that can be subscribed to when using push notifications.
 * Each Subscription type will be available for all {@link Nation} models.
 *
 * The actual active subscriptions for each Expo push token is defined
 * in the {@link Subscription} model.
 *
 * @category Model
 * @module SubscriptionTopic
 */
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class SubscriptionTopic extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    /**
     * The name of the subscription type, e.g. "News" or "Events"
     */
    @column()
    public name: string

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime
}
