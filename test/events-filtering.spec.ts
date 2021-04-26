import test from 'japa'
import { DateTime } from 'luxon'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import {
    createTestCategory,
    createTestEvent,
    createTestNation,
} from 'App/Utils/Test'
import { NationFactory } from '../database/factories/index'

test.group('Events filtering', async () => {
    test('ensure that you can filter by specific date', async (assert) => {
        const nation = await NationFactory.create()
        const testEventOne = await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 1,
                day: 12,
                hour: 20,
            })
        )
        const testEventTwo = await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 1,
                day: 13,
                hour: 20,
            })
        )

        const eventOne = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/events?date=${testEventOne.occursAt.toISODate()}`)
            .expect(200)

        const dataOne = JSON.parse(eventOne.text)

        assert.isArray(dataOne.data)
        assert.lengthOf(dataOne.data, 1)
        assert.equal(dataOne.data[0].name, testEventOne.name)
        assert.equal(dataOne.data[0].occurs_at, testEventOne.occursAt.toISO())

        const eventTwo = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/events?date=${testEventTwo.occursAt.toISODate()}`)
            .expect(200)

        const dataTwo = JSON.parse(eventTwo.text)

        assert.isArray(dataTwo.data)
        assert.lengthOf(dataTwo.data, 1)
        assert.equal(dataTwo.data[0].name, testEventTwo.name)
        assert.equal(dataTwo.data[0].occurs_at, testEventTwo.occursAt.toISO())
    })

    test('ensure that you can filter by all before date', async (assert) => {
        const nation = await NationFactory.create()
        const testEventOne = await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 12,
                hour: 20,
            })
        )
        const testEventTwo = await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 13,
                hour: 20,
            })
        )

        const { text } = await supertest(BASE_URL)
            .get(
                `/nations/${nation.oid}/events?before=${testEventTwo.occursAt
                    .plus({ day: 1 })
                    .toISODate()}`
            )
            .expect(200)

        const data = JSON.parse(text)

        assert.isArray(data.data)
        assert.lengthOf(data.data, 2)
        assert.equal(data.data[0].name, testEventOne.name)
        assert.equal(data.data[0].occurs_at, testEventOne.occursAt.toISO())
        assert.equal(data.data[1].name, testEventTwo.name)
        assert.equal(data.data[1].occurs_at, testEventTwo.occursAt.toISO())
    })

    test('ensure that filtering by all before date return empty array if no events exists', async (assert) => {
        const nation = await NationFactory.create()
        const testEventOne = await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 12,
                hour: 20,
            })
        )
        await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 13,
                hour: 22,
            })
        )

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/events?before=${testEventOne.occursAt.toISODate()}`)
            .expect(200)

        const data = JSON.parse(text)

        assert.isArray(data.data)
        assert.lengthOf(data.data, 0)
    })

    test('ensure that you can filter by all after date', async (assert) => {
        const nation = await NationFactory.create()
        const testEventOne = await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 12,
                hour: 20,
            })
        )
        const testEventTwo = await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 13,
                hour: 22,
            })
        )

        const { text } = await supertest(BASE_URL)
            .get(
                `/nations/${nation.oid}/events?after=${testEventOne.occursAt
                    .minus({ day: 1 })
                    .toISODate()}`
            )
            .expect(200)

        const data = JSON.parse(text)

        assert.isArray(data.data)
        assert.lengthOf(data.data, 2)
        assert.equal(data.data[0].name, testEventOne.name)
        assert.equal(data.data[0].occurs_at, testEventOne.occursAt.toISO())
        assert.equal(data.data[1].name, testEventTwo.name)
        assert.equal(data.data[1].occurs_at, testEventTwo.occursAt.toISO())
    })

    test('ensure that filtering by all after date return empty array if no events exists', async (assert) => {
        const nation = await NationFactory.create()
        await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 12,
                hour: 20,
            })
        )
        const testEventTwo = await createTestEvent(
            nation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 13,
                hour: 22,
            })
        )

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/events?after=${testEventTwo.occursAt.toISODate()}`)
            .expect(200)

        const data = JSON.parse(text)

        assert.isArray(data.data)
        assert.lengthOf(data.data, 0)
    })

    test('ensure that filters only accepts the correct format', async () => {
        ;['date', 'before', 'after'].forEach(async (filter) => {
            await supertest(BASE_URL).get(`/events?${filter}=2020-000-11`).expect(422)

            await supertest(BASE_URL).get(`/events?${filter}=20201130`).expect(422)

            await supertest(BASE_URL).get(`/events?${filter}=2020-00-11T20:00:00Z`).expect(422)

            await supertest(BASE_URL).get(`/events?${filter}=asdasd`).expect(422)
        })
    })

    test('ensure that filtering for 1 event in a request is viable', async (assert) => {
        const nation = await NationFactory.create()
        await createTestEvent(nation.oid)
        await createTestEvent(nation.oid)
        const { text } = await supertest(BASE_URL).get(`/events?page=1&amount=1`).expect(200)

        const data = JSON.parse(text)
        assert.equal(data.meta.per_page, 1)
        assert.equal(data.data.length, 1)
    })

    test('ensure that filtering for 2 events in a request is viable', async (assert) => {
        const nation = await NationFactory.create()
        await createTestEvent(nation.oid)
        await createTestEvent(nation.oid)

        const { text } = await supertest(BASE_URL).get(`/events?page=2&amount=2`).expect(200)

        const data = JSON.parse(text)
        assert.equal(data.meta.per_page, 2)
        assert.equal(data.data.length, 2)
    })

    test('ensure that filtering for incorrect type in url is not viable', async () => {
        await supertest(BASE_URL).get(`/events?page=asdf`).expect(422)
    })

    test('ensure that filtering for 0 events returns no event', async (assert) => {
        const nation = await NationFactory.create()
        await createTestEvent(nation.oid)
        await createTestEvent(nation.oid)
        await createTestEvent(nation.oid)
        await createTestEvent(nation.oid)
        await createTestEvent(nation.oid)

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/events?page=1&amount=0`)
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.meta.per_page, 0)
        assert.equal(data.data.length, 0)
    })

    test('ensure that filtering for 0 pages is not viable', async () => {
        await supertest(BASE_URL).get(`/events?page=0&amount=0`).expect(422)
    })

    test('ensure that filtering for negative amount is not viable', async () => {
        await supertest(BASE_URL).get(`/events?page=1&amount=-20`).expect(422)
    })

    test('ensure that filtering for different categories returns different set of events per category', async (assert) => {
        const nation = await createTestNation()
        const event1 = await createTestEvent(nation.oid)
        const event2 = await createTestEvent(nation.oid)
        const event3 = await createTestEvent(nation.oid)
        const event4 = await createTestEvent(nation.oid)
        const event5 = await createTestEvent(nation.oid)
        const category1 = await createTestCategory()
        const category2 = await createTestCategory()

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event1.id}`)
            .send({ category_id: category1.id })
            .expect(200)
            .set('Authorization', 'Bearer ' + nation.token)
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event2.id}`)
            .send({ category_id: category1.id })
            .expect(200)
            .set('Authorization', 'Bearer ' + nation.token)
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event3.id}`)
            .send({ category_id: category2.id })
            .expect(200)
            .set('Authorization', 'Bearer ' + nation.token)
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event4.id}`)
            .send({ category_id: category2.id })
            .expect(200)
            .set('Authorization', 'Bearer ' + nation.token)
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event5.id}`)
            .send({ category_id: category2.id })
            .expect(200)
            .set('Authorization', 'Bearer ' + nation.token)

        const text1 = await supertest(BASE_URL).get(`/events?category=${category1.id}`).expect(200)

        const data1 = JSON.parse(text1.text)
        assert.equal(data1.meta.total, 2)
        assert.equal(data1.data.length, 2)

        const text2 = await supertest(BASE_URL).get(`/events?category=${category2.id}`).expect(200)

        const data2 = JSON.parse(text2.text)
        assert.equal(data2.meta.total, 3)
        assert.equal(data2.data.length, 3)
    })

    test('ensuer filtering for an empty category has no events', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/events?category=5`).expect(200)

        const data = JSON.parse(text)
        assert.equal(data.meta.total, 0)
        assert.equal(data.data.length, 0)
    })
})
