import test from 'japa'
import supertest from 'supertest'
import Nation from 'App/Models/Nation'
import { BASE_URL } from 'App/Utils/Constants'
import { createStaffUser } from 'App/Utils/Test'
import { ActivityLevels } from 'App/Utils/Activity'
import { NationFactory } from 'Database/factories/index'

const INVALID_NATION_OID = 9999999999

test.group('Fetch nation', () => {
    test('ensure you can fetch all nations', async (assert) => {
        await NationFactory.createMany(5)

        const { text } = await supertest(BASE_URL).get('/nations').expect(200)
        const data = JSON.parse(text)

        assert.isArray(data)
        data.forEach((nation: Nation) => assert.isObject(nation))
    })

    test('ensure that fetching a nation using an invalid oid gives an error', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/nations/${INVALID_NATION_OID}`).expect(404)
        const data = JSON.parse(text)

        assert.equal(data.status, 404)
        assert.exists(data.errors)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
        assert.isObject(data.errors[0])
        assert.isDefined(data.errors[0].message)
    })

    test('ensure that fetching a nation using a valid oid returns the nation', async (assert) => {
        const nation = await NationFactory.create()
        const { text } = await supertest(BASE_URL).get(`/nations/${nation.oid}`).expect(200)

        const data = JSON.parse(text)
        const serializedNation = nation.toJSON()

        for (const key of Object.keys(serializedNation)) {
            assert.equal(serializedNation[key], data[key])
        }
    })
})

test.group('Update nation information', () => {
    test('ensure that updating a nation requires a valid token', async (assert) => {
        const { oid } = await NationFactory.create()
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send({ address: 'new address' })
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that updating a non-existant nation with a valid token fails', async () => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        await supertest(BASE_URL)
            .put(`/nations/${INVALID_NATION_OID}`)
            .set('Authorization', 'Bearer ' + token)
            .send({ address: 'new address' })
            .expect(404)
    })

    test('ensure that updating a nation with a non-admin token fails', async () => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, false)

        await supertest(BASE_URL)
            .put(`/nations/${oid}`)
            .set('Authorization', 'Bearer ' + token)
            .send({ address: 'new address' })
            .expect(401)
    })

    test('ensure that trying to update a nation with no request data fails', async () => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        await supertest(BASE_URL)
            .put(`/nations/${oid}`)
            .set('Authorization', 'Bearer ' + token)
            .expect(400)
    })

    test('ensure that invalid properties are removed when updating a nation', async (assert) => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        await supertest(BASE_URL)
            .put(`/nations/${oid}`)
            .set('Authorization', 'Bearer ' + token)
            .send({
                invalidKey: 'hello',
                anotherInvalidKey: 'world',
            })
            .expect(400)
    })

    test('ensure that updating a nation updates the database', async (assert) => {
        const originalNation = await NationFactory.create()
        const newNationData = {
            name: 'test-name',
            short_name: 'test-short',
            description: 'test-description',
            address: 'test-address 123',
            max_capacity: 100,
            accent_color: '#FFFFFF',
        }

        const { token } = await createStaffUser(originalNation.oid, true)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${originalNation.oid}`)
            .set('Authorization', 'Bearer ' + token)
            .send(newNationData)
            .expect(200)

        const data = JSON.parse(text)
        const savedNation = await Nation.findByOrFail('oid', originalNation.oid)
        const savedNationData = savedNation.toJSON()

        // Make sure that the updated nation contains the same data
        // as in newNationData. Also make sure that the database has been updated.
        for (const [key, value] of Object.entries(newNationData)) {
            assert.equal(data[key], value)
            assert.equal(savedNationData[key], value)
        }
    })
})

test.group('Update nation activity', () => {
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
