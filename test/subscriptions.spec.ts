import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import Subscription from 'App/Models/Subscription'
import { NationFactory, PushTokenFactory, SubscriptionTopicFactory } from 'Database/factories/index'

test.group('Subscription fetch', () => {
    test('ensure that you can fetch all topics', async (assert) => {
        const initialResponse = await supertest(BASE_URL).get('/subscriptions/topics').expect(200)
        const initialData = JSON.parse(initialResponse.text)

        assert.isArray(initialData)

        const newTopicAmount = 3
        await SubscriptionTopicFactory.createMany(newTopicAmount)

        const { text } = await supertest(BASE_URL).get('/subscriptions/topics').expect(200)
        const data = JSON.parse(text)

        assert.isArray(data)
        assert.lengthOf(data, initialData.length + newTopicAmount)
    })

    test('ensure that you get an error if fetching subscriptions with invalid token', async () => {
        await supertest(BASE_URL).get('/subscriptions').expect(422)
    })

    test('ensure that you get an error if fetching subscriptions with token of invalid format', async () => {
        await supertest(BASE_URL).get('/subscriptions?token=123123123').expect(422)
        await supertest(BASE_URL)
            .get('/subscriptions?token=ExponentPushToken[xxxxxxxxxxxx')
            .expect(422)
    })

    test('ensure that fetching subscription for valid token with no subscription returns empty array', async (assert) => {
        const pushToken = await PushTokenFactory.create()
        const { text } = await supertest(BASE_URL)
            .get(`/subscriptions?token=${pushToken.token}`)
            .expect(200)
        const data = JSON.parse(text)

        assert.isArray(data)
        assert.lengthOf(data, 0)
    })

    test('ensure that fetching subscription for valid token returns all subscriptions', async (assert) => {
        const nation = await NationFactory.create()
        const pushToken = await PushTokenFactory.create()
        const topicOne = await SubscriptionTopicFactory.create()
        const topicTwo = await SubscriptionTopicFactory.create()
        const subscriptionOne = await Subscription.create({
            nationId: nation.oid,
            pushTokenId: pushToken.id,
            subscriptionTopicId: topicOne.id,
        })

        const subscriptionTwo = await Subscription.create({
            nationId: nation.oid,
            pushTokenId: pushToken.id,
            subscriptionTopicId: topicTwo.id,
        })

        const { text } = await supertest(BASE_URL)
            .get(`/subscriptions?token=${pushToken.token}`)
            .expect(200)
        const data = JSON.parse(text)

        assert.isArray(data)
        assert.lengthOf(data, 2)
        assert.includeDeepMembers(data, [subscriptionOne.toJSON(), subscriptionTwo.toJSON()])
    })
})

test.group('Subscription create', (group) => {})

test.group('Subscription delete', (group) => {})
