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
        assert.equal(data.success, false)
        assert.exists(data.message)
        assert.isNotEmpty(data.message)
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

    test('ensure that updating a nation activity works with staff permissions', async () => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, false)

        await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
    })

    test('ensure that updating a nation activity works with admin permissions', async () => {
        const { oid } = await NationFactory.create()
        const { token } = await createStaffUser(oid, true)

        await supertest(BASE_URL)
            .put(`/nations/${oid}/activity`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
    })
})
