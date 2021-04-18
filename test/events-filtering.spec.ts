import test from 'japa'
import { DateTime } from 'luxon'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { createTestEvent } from 'App/Utils/Test'
import { NationFactory } from '../database/factories/index'

test.group('Events filtering', async () => {
    test('ensure that you can filter by specific date', async (assert) => {
        const testNation = await NationFactory.create()
        const testEventOne = await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 1,
                day: 12,
                hour: 20,
            })
        )
        const testEventTwo = await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 1,
                day: 13,
                hour: 20,
            })
        )

        const eventOne = await supertest(BASE_URL)
            .get(`/nations/${testNation.oid}/events?date=${testEventOne.occursAt.toISODate()}`)
            .expect(200)

        const dataOne = JSON.parse(eventOne.text)

        assert.isArray(dataOne)
        assert.lengthOf(dataOne, 1)
        assert.equal(dataOne[0].name, testEventOne.name)
        assert.equal(dataOne[0].occurs_at, testEventOne.occursAt.toISO())

        const eventTwo = await supertest(BASE_URL)
            .get(`/nations/${testNation.oid}/events?date=${testEventTwo.occursAt.toISODate()}`)
            .expect(200)

        const dataTwo = JSON.parse(eventTwo.text)

        assert.isArray(dataTwo)
        assert.lengthOf(dataTwo, 1)
        assert.equal(dataTwo[0].name, testEventTwo.name)
        assert.equal(dataTwo[0].occurs_at, testEventTwo.occursAt.toISO())
    })

    test('ensure that you can filter by all before date', async (assert) => {
        const testNation = await NationFactory.create()
        const testEventOne = await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 12,
                hour: 20,
            })
        )
        const testEventTwo = await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 13,
                hour: 20,
            })
        )

        const { text } = await supertest(BASE_URL)
            .get(
                `/nations/${testNation.oid}/events?before=${testEventTwo.occursAt
                    .plus({ day: 1 })
                    .toISODate()}`
            )
            .expect(200)

        const data = JSON.parse(text)

        assert.isArray(data)
        assert.lengthOf(data, 2)
        assert.equal(data[0].name, testEventOne.name)
        assert.equal(data[0].occurs_at, testEventOne.occursAt.toISO())
        assert.equal(data[1].name, testEventTwo.name)
        assert.equal(data[1].occurs_at, testEventTwo.occursAt.toISO())
    })

    test('ensure that filtering by all before date return empty array if no events exists', async (assert) => {
        const testNation = await NationFactory.create()
        const testEventOne = await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 12,
                hour: 20,
            })
        )
        await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 13,
                hour: 22,
            })
        )

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${testNation.oid}/events?before=${testEventOne.occursAt.toISODate()}`)
            .expect(200)

        const data = JSON.parse(text)

        assert.isArray(data)
        assert.lengthOf(data, 0)
    })

    test('ensure that you can filter by all after date', async (assert) => {
        const testNation = await NationFactory.create()
        const testEventOne = await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 12,
                hour: 20,
            })
        )
        const testEventTwo = await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 13,
                hour: 22,
            })
        )

        const { text } = await supertest(BASE_URL)
            .get(
                `/nations/${testNation.oid}/events?after=${testEventOne.occursAt
                    .minus({ day: 1 })
                    .toISODate()}`
            )
            .expect(200)

        const data = JSON.parse(text)

        assert.isArray(data)
        assert.lengthOf(data, 2)
        assert.equal(data[0].name, testEventOne.name)
        assert.equal(data[0].occurs_at, testEventOne.occursAt.toISO())
        assert.equal(data[1].name, testEventTwo.name)
        assert.equal(data[1].occurs_at, testEventTwo.occursAt.toISO())
    })

    test('ensure that filtering by all after date return empty array if no events exists', async (assert) => {
        const testNation = await NationFactory.create()
        await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 12,
                hour: 20,
            })
        )
        const testEventTwo = await createTestEvent(
            testNation.oid,
            DateTime.fromObject({
                year: 1999,
                month: 2,
                day: 13,
                hour: 22,
            })
        )

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${testNation.oid}/events?after=${testEventTwo.occursAt.toISODate()}`)
            .expect(200)

        const data = JSON.parse(text)

        assert.isArray(data)
        assert.lengthOf(data, 0)
    })

    test('ensure that filters only accepts the correct format', async () => {
        ;['date', 'before', 'after'].forEach(async (filter) => {
            await supertest(BASE_URL).get(`/events?${filter}=2020-000-11`).expect(422)

            await supertest(BASE_URL).get(`/events?${filter}=20201130`).expect(422)

            await supertest(BASE_URL).get(`/events?${filter}=2020-00-11T20:00:00Z`).expect(422)

            await supertest(BASE_URL).get(`/events?${filter}=asdasd`).expect(422)
        })
    })
})
