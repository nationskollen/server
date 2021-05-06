import { Topics } from 'App/Utils/Subscriptions'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'

export default class SubscriptionTopicSeeder extends BaseSeeder {
    protected developmentOnly = false

    public async run () {
        await SubscriptionTopic.updateOrCreate({ name: Topics.News }, {})
        await SubscriptionTopic.updateOrCreate({ name: Topics.Events }, {})
    }
}
