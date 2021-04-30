import test from 'japa'
import { DateTime } from 'luxon'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { TestNationContract, createTestNation } from 'App/Utils/Test'
import Notification from 'App/Models/Notification'

test.group('Notification fetch', (group) => {
    let nation: TestNationContract
    let eventData = {
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
    })

    test('ensure creating an event, we can fetch the notification', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(eventData)
            .expect(200)

        const data = JSON.parse(text)

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

    test('ensure we can fetch notifications after certain date', async (assert) => {
        const date = new Date().toISOString()
        const { text } = await supertest(BASE_URL).get(`/notifications?after=${date}`).expect(200)

        const data = JSON.parse(text)
        assert.equal(data.data.length, 0)
    })

    test('ensure that notifications have correct ISO format', async () => {
        const yesterday = DateTime.local().minus({ day: 1 }).toISO()
        await supertest(BASE_URL)
            .get(`/notifications?after=${encodeURIComponent(yesterday)}`)
            .expect(200)
    })

    test('ensure that incorrect ISO format is not viable', async () => {
        await supertest(BASE_URL).get(`/notifications?after=2021-0101T`).expect(422)
    })

    test('ensure we cannot fetch a non-existing notification', async () => {
        await supertest(BASE_URL).get(`/notifications/999999999`).expect(404)
    })
})

test.group('Notification create', (group) => {
    let nation: TestNationContract
    let eventData = {
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
    })

    test('ensure creating an event also creates a notification with it', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(eventData)
            .expect(200)

        const data = JSON.parse(text)
        assert.isTrue(data.hasOwnProperty('notification_id'))
        assert.isNotNull(data.notification_id)
    })

    test('ensure creating an notification is possible', async (assert) => {
        const notification = await Notification.create({
            title: eventData.name,
            message: eventData.short_description,
        })
        assert.isNotNull(notification)
    })
})
