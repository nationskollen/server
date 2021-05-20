import test from 'japa'
import { DateTime } from 'luxon'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { Topics } from 'App/Utils/Subscriptions'
import Subscription from 'App/Models/Subscription'
import Notification from 'App/Models/Notification'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'
import { TestNationContract, createTestNation, createTestEvent } from 'App/Utils/Test'
import { NationFactory, PushTokenFactory, SubscriptionTopicFactory } from 'Database/factories/index'

test.group('Notification fetch', (group) => {
    let nation: TestNationContract
    const eventData = {
        name: 'notificationEvent',
        short_description: 'NotEvent',
        long_description: 'Lorem ipsum',
        occurs_at: DateTime.fromObject({
            year: 2021,
            month: 3,
            day: 16,
            hour: 15,
            minute: 20,
        }).toISO(),
        ends_at: DateTime.fromObject({
            year: 2021,
            month: 3,
            day: 16,
            hour: 20,
            minute: 0,
        }).toISO(),
    }

    group.before(async () => {
        nation = await createTestNation()

        // Make sure to create a topic so that notifications can be created
        await SubscriptionTopic.create({ name: Topics.Events })
    })

    test('ensure creating an event, we can fetch the notification', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(eventData)
            .expect(200)

        const data = JSON.parse(text)
        assert.isNotNull(data.notification_id)

        const text1 = await supertest(BASE_URL)
            .get(`/notifications/${data.notification_id}`)
            .expect(200)

        const data1 = JSON.parse(text1.text)
        assert.isNotNull(data1)
        assert.equal(data.short_description, data1.message)
        assert.equal(data.name, data1.title)
    })

    test('ensure we can fetch all notifications', async (assert) => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(eventData)
            .expect(200)

        const { text } = await supertest(BASE_URL).get(`/notifications`).expect(200)

        const data = JSON.parse(text)
        assert.notEqual(data.data.length, 0)
    })

    test('ensure we can fetch notifications for a token', async (assert) => {
        const pushToken = await PushTokenFactory.create()
        const responseOne = await supertest(BASE_URL)
            .get(`/notifications?token=${pushToken.token}`)
            .expect(200)
        const dataOne = JSON.parse(responseOne.text)

        assert.lengthOf(dataOne.data, 0)

        const topic = await SubscriptionTopicFactory.create()
        const subscription = await Subscription.create({
            nationId: nation.oid,
            subscriptionTopicId: topic.id,
            pushTokenId: pushToken.id,
        })

        await Notification.create({
            title: 'Test',
            message: 'test',
            subscriptionTopicId: topic.id,
            nationId: subscription.nationId,
        })

        await Notification.create({
            title: 'Test 2',
            message: 'test 2',
            subscriptionTopicId: topic.id,
            nationId: subscription.nationId,
        })

        const responseTwo = await supertest(BASE_URL)
            .get(`/notifications?token=${pushToken.token}`)
            .expect(200)
        const dataTwo = JSON.parse(responseTwo.text)

        assert.lengthOf(dataTwo.data, 2)
    })

    test('ensure we can fetch notifications for a token with multiple subscriptions', async (assert) => {
        const nationTwo = await NationFactory.create()
        const pushToken = await PushTokenFactory.create()
        const responseOne = await supertest(BASE_URL)
            .get(`/notifications?token=${pushToken.token}`)
            .expect(200)
        const dataOne = JSON.parse(responseOne.text)

        assert.lengthOf(dataOne.data, 0)

        const topicOne = await SubscriptionTopicFactory.create()
        const topicTwo = await SubscriptionTopicFactory.create()
        const subscriptionOne = await Subscription.create({
            nationId: nation.oid,
            subscriptionTopicId: topicOne.id,
            pushTokenId: pushToken.id,
        })

        const subscriptionTwo = await Subscription.create({
            nationId: nationTwo.oid,
            subscriptionTopicId: topicTwo.id,
            pushTokenId: pushToken.id,
        })

        await Notification.create({
            title: 'Test',
            message: 'test',
            subscriptionTopicId: topicOne.id,
            nationId: subscriptionOne.nationId,
        })

        await Notification.create({
            title: 'Test 2',
            message: 'test 2',
            subscriptionTopicId: topicTwo.id,
            nationId: subscriptionTwo.nationId,
        })

        const responseTwo = await supertest(BASE_URL)
            .get(`/notifications?token=${pushToken.token}`)
            .expect(200)
        const dataTwo = JSON.parse(responseTwo.text)

        assert.lengthOf(dataTwo.data, 2)
    })

    test('ensure fetching notifications for token with no subscriptions returns empty array', async (assert) => {
        const newNation = await NationFactory.create()
        const pushToken = await PushTokenFactory.create()
        const topic = await SubscriptionTopicFactory.create()

        await Subscription.create({
            nationId: nation.oid,
            subscriptionTopicId: topic.id,
            pushTokenId: pushToken.id,
        })

        // Create notification for other nation
        await Notification.create({
            title: 'Test',
            message: 'test',
            subscriptionTopicId: topic.id,
            nationId: newNation.oid,
        })

        const { text } = await supertest(BASE_URL)
            .get(`/notifications?token=${pushToken.token}`)
            .expect(200)
        const data = JSON.parse(text)

        assert.lengthOf(data.data, 0)
    })

    test('ensure fetching notifications only return notifications that match the subscriptions', async (assert) => {
        const pushToken = await PushTokenFactory.create()
        const topic = await SubscriptionTopicFactory.create()

        await Notification.create({
            title: 'Test',
            message: 'test',
            subscriptionTopicId: topic.id,
            nationId: nation.oid,
        })

        await Notification.create({
            title: 'Test',
            message: 'test',
            subscriptionTopicId: topic.id,
            nationId: nation.oid,
        })

        const { text } = await supertest(BASE_URL)
            .get(`/notifications?token=${pushToken.token}`)
            .expect(200)
        const data = JSON.parse(text)

        assert.lengthOf(data.data, 0)
    })

    test('ensure fetching notifications for invalid token throws error', async () => {
        await supertest(BASE_URL).get(`/notifications?token=ExponentPushToken[asdas]`).expect(400)
    })

    test('ensure we cannot fetch a non-existing notification', async () => {
        await supertest(BASE_URL).get(`/notifications/999999999`).expect(404)
    })

    test('ensure that date filtering allows ISO format', async () => {
        const yesterday = DateTime.local().minus({ day: 1 }).toISO()
        await supertest(BASE_URL)
            .get(`/notifications?after=${encodeURIComponent(yesterday)}`)
            .expect(200)
    })

    test('ensure that date filtering fails if it is not ISO formatted', async () => {
        await supertest(BASE_URL).get(`/notifications?after=2021-0101T`).expect(422)
    })

    test.skipInCI(
        'ensure that the pagination array is empty if the after date is too recent',
        async (assert) => {
            const date = new Date().toISOString()
            const { text } = await supertest(BASE_URL)
                .get(`/notifications?after=${date}`)
                .expect(200)

            const data = JSON.parse(text)
            assert.equal(data.data.length, 0)
        }
    )

    test.skipInCI('ensure we can fetch notifications after date', async (assert) => {
        // Save time before before creating event
        const date = new Date().toISOString()

        // Make sure no notifications currently exists after this date
        const responseOne = await supertest(BASE_URL)
            .get(`/notifications?after=${date}`)
            .expect(200)
        const dataOne = JSON.parse(responseOne.text)
        assert.equal(dataOne.data.length, 0)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(eventData)
            .expect(200)

        const responseTwo = await supertest(BASE_URL)
            .get(`/notifications?after=${date}`)
            .expect(200)

        const dataTwo = JSON.parse(responseTwo.text)
        assert.equal(dataTwo.data.length, 1)
        assert.equal(dataTwo.data[0].title, eventData.name)
    })

    test.skipInCI('ensure that notifications are ordered by descending order', async (assert) => {
        const numberOfEvents = 3
        for (let i = 0; i < numberOfEvents; i++) {
            createTestEvent(nation.oid)
        }

        const { text } = await supertest(BASE_URL)
            .get(`/notifications`)
            .expect(200)

        const data = JSON.parse(text)

        let tmp: Array<Notification> = []
        for (const notification of data.data) {
            tmp.push(notification)
        } 

        for (let i = 0; i < data.meta.total; i++) {
            if (tmp[i+1]) {
                assert.isAbove(tmp[i].id, tmp[i+1].id)
            }
        }
    })
})
