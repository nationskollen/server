import test from 'japa'
import supertest from 'supertest'
import Nation from 'App/Models/Nation'
import { BASE_URL } from 'App/Utils/Constants'
import { createStaffUser } from 'App/Utils/Test'
import { ActivityLevels } from 'App/Utils/Activity'
import { NationFactory } from 'Database/factories/index'

const INVALID_NATION_OID = 9999999999

test.group('Activity update', () => {
    test('ensure that updating a nation activity requires authorization', async () => {
        const { oid } = await NationFactory.create()
        // Create a user for another nation
        const { token } = await createStaffUser(oid + 1, false)

        await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .expect(401)
    })

    test('ensure that trying to update nation activity with no request data fails', async () => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, false)

        await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .expect(422)
    })

    test('ensure that invalid properties are removed when updating nation activity', async () => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, false)

        await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .send({
                invalidKey: 'hello',
                anotherInvalidKey: 'world',
            })
            .expect(422)
    })

    test('ensure that updating a nation activity works with staff permissions', async (assert) => {
        const { oid, maxCapacity } = await NationFactory.create()
        const { token } = await createStaffUser(oid, false)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .send({ change: maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, maxCapacity)
    })

    test('ensure that updating a nation activity works with admin permissions', async (assert) => {
        const { oid, maxCapacity } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .send({ change: maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, maxCapacity)
    })

    test('ensure that nation people count does not go below 0', async (assert) => {
        const { oid, maxCapacity } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .send({ change: -1 * (maxCapacity + 10) })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that nation people count does not go above max capacity', async (assert) => {
        const { oid, maxCapacity } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .send({ change: maxCapacity + 10 })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, maxCapacity)
    })

    test('ensure that activity level changes dynamically to full', async (assert) => {
        const { oid, maxCapacity } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        // Since .isOpen default to false, we need to make sure it is open in
        // order to test it closing.
        await supertest(BASE_URL)
            .put(`/nations/${oid}/open`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .send({ change: maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.activity_level, ActivityLevels.Full)
    })

    test('ensure that activity level changes dynamically to medium +- 1 (range: low - high)', async (assert) => {
        const { oid, maxCapacity, estimatedPeopleCount } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        // Since .isOpen default to false, we need to make sure it is open in
        // order to test it closing.
        await supertest(BASE_URL)
            .put(`/nations/${oid}/open`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .send({ change: maxCapacity - maxCapacity / 2 - estimatedPeopleCount })
            .expect(200)

        const data = await JSON.parse(text)

        assert.closeTo(data.activity_level, ActivityLevels.Medium, 1)
    })

    test('ensure that activity level changes dynamically to low (when rounding from 0)', async (assert) => {
        const { oid, maxCapacity } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        // Since .isOpen default to false, we need to make sure it is open in
        // order to test it closing.
        await supertest(BASE_URL)
            .put(`/nations/${oid}/open`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .send({ change: -1 * maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)
        // TODO Should become low during opening hours, but is "closed"
        assert.equal(data.activity_level, ActivityLevels.Low)
    })

    test('ensure that nation is closed on PUT', async (assert) => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        // Since .isOpen default to false, we need to make sure it is open in
        // order to test it closing.
        await supertest(BASE_URL)
            .put(`/nations/${oid}/open`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}/close`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)

        const data = await JSON.parse(text)
        assert.equal(data.activity_level, ActivityLevels.Closed)
        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that nation is open on PUT', async (assert) => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}/open`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)

        const data = await JSON.parse(text)
        assert.equal(data.activity_level, ActivityLevels.Low)
        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that max capacity cannot be set to 0', async (assert) => {
        const { oid, maxCapacity } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        await supertest(BASE_URL)
            .put(`/nations/${oid}`)
            .set('Authorization', 'Bearer ' + token)
            .send({ max_capacity: 0 })
            .expect(422)

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${oid}`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)

        const data = await JSON.parse(text)
        assert.equal(data.max_capacity, maxCapacity)
    })
})
