import test from 'japa'
import supertest from 'supertest'
import Nation from 'App/Models/Nation'
import { BASE_URL } from 'App/Utils/Constants'
import { createStaffUser } from 'App/Utils/Test'
import { NationFactory } from 'Database/factories/index'
import { TestNationContract, createTestNation } from 'App/Utils/Test'

const INVALID_NATION_OID = 9999999999

test.group('Nation fetch', () => {
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
        const openingHoursCount = 2
        const openingHourExceptionsCount = 4

        const nation = await NationFactory.with('locations', 1, (location) => {
            location
                .with('openingHours', openingHoursCount)
                .with('openingHourExceptions', openingHourExceptionsCount)
        }).create()

        let nationData = await supertest(BASE_URL).get(`/nations/${nation.oid}`).expect(200)
        let parsedNationData = JSON.parse(nationData.text)

        assert.isArray(parsedNationData.locations)
        assert.lengthOf(parsedNationData.locations, 1)

        let locationData = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/locations/${parsedNationData.locations[0].id}`)
            .expect(200)
        const parsedLocationData = JSON.parse(locationData.text)

        assert.isArray(parsedLocationData.opening_hours)
        assert.isArray(parsedLocationData.opening_hour_exceptions)
        assert.lengthOf(parsedLocationData.opening_hours, openingHoursCount)
        assert.lengthOf(parsedLocationData.opening_hour_exceptions, openingHourExceptionsCount)
    })
})

test.group('Nation update', (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that updating a nation requires a valid token', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send({ accent_color: '#333333' })
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that updating a non-existant nation with a valid token fails', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${INVALID_NATION_OID}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ accent_color: '#333333' })
            .expect(404)
    })

    test('ensure that updating a nation with a non-admin token fails', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ accent_color: '#333333' })
            .expect(401)
    })

    test('ensure that trying to update a nation with no request data fails', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(400)
    })

    test('ensure that invalid properties are removed when updating a nation', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + nation.token)
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

test.group('Nation upload', (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that uploading an image requires an attachment', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ randomData: 'hello' })
            .expect(422)
    })
})
