import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import PushToken from 'App/Models/PushToken'
import Subscription from 'App/Models/Subscription'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'
import { NationFactory, PushTokenFactory, SubscriptionTopicFactory } from 'Database/factories/index'
import { TestNationContract, createTestNation } from 'App/Utils/Test'

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

test.group('Subscription create', (group) => {
    let nation: TestNationContract
    let pushToken: PushToken
    let topicOne: SubscriptionTopic

    group.before(async () => {
        nation = await createTestNation()
        pushToken = await PushTokenFactory.create()
        topicOne = await SubscriptionTopicFactory.create()
    })

    test('ensure creating a subscription requires a valid token', async () => {
        await supertest(BASE_URL)
            .post('/subscriptions')
            .send({
                oid: nation.oid,
                topic: topicOne.id,
            })
            .expect(422)
    })

    test('ensure creating a subscription is viable with a token', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/subscriptions`)
            .send({
                oid: nation.oid,
                token: pushToken.token,
                topic: topicOne.id,
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.isNotNull(data)
        assert.equal(data.subscription_topic_id, topicOne.id)
        assert.equal(data.nation_id, nation.oid)
    })

    test('ensure creating a subscription is only viable to existing nations', async () => {
        await supertest(BASE_URL)
            .post(`/subscriptions`)
            .send({
                oid: 9999999999999,
                token: pushToken.token,
                topic: topicOne.id,
            })
            .expect(422)
    })

    test('ensure creating a subscription is only viable to existing topic', async () => {
        await supertest(BASE_URL)
            .post(`/subscriptions`)
            .send({
                oid: nation.oid,
                token: pushToken.token,
                topic: 999999999,
            })
            .expect(422)
    })

    test('ensure creating a subscription with the same data as an existing subscription is ignored', async (assert) => {
        const topic = await SubscriptionTopicFactory.create()
        const subscription = {
            oid: nation.oid,
            token: pushToken.id,
            topic: topic.id,
        }

        const responseOne = await supertest(BASE_URL)
            .post(`/subscriptions?token=${pushToken.token}`)
            .send(subscription)
            .expect(200)

        const responseTwo = await supertest(BASE_URL)
            .post(`/subscriptions?token=${pushToken.token}`)
            .send(subscription)
            .expect(200)

        const dataOne = JSON.parse(responseOne.text)
        const dataTwo = JSON.parse(responseTwo.text)

        assert.equal(dataOne.uuid, dataTwo.uuid)
        assert.equal(dataOne.subscription_topic_id, dataTwo.subscription_topic_id)
        assert.equal(dataOne.nation_id, dataTwo.nation_id)
    })
})

test.group('Subscription delete', (group) => {
    let nation: TestNationContract
    let pushToken: PushToken
    let topicOne: SubscriptionTopic

    group.before(async () => {
        nation = await createTestNation()
        pushToken = await PushTokenFactory.create()
        topicOne = await SubscriptionTopicFactory.create()
    })

    test('ensure deleting a subscription is only viable to existing subscriptions', async () => {
        const subscription = await Subscription.create({
            nationId: nation.oid,
            pushTokenId: pushToken.id,
            subscriptionTopicId: topicOne.id,
        })

        await supertest(BASE_URL).delete(`/subscriptions/${subscription.uuid}`).expect(200)
        await supertest(BASE_URL).get(`/subscriptions/${subscription.uuid}`).expect(404)
    })

    test('ensure deleting a non-existing subscription is not viable', async () => {
        await supertest(BASE_URL).delete(`/subscriptions/9999999999999`).expect(404)
    })
})
