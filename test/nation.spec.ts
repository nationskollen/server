import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/User'
import Nation from 'App/Models/Nation'
import { NationFactory, UserFactory } from 'Database/factories/index'
import { BASE_URL } from 'App/Utils/Constants'

const INVALID_NATION_OID = 9999999999

async function createNation(adminUserId?: number) {
    if (adminUserId) {
        return await NationFactory.merge({ adminUserId }).create()
    }

    return NationFactory.create()
}

async function createAdmin() {
    const password = 'admintest'
    const { id, email } = await UserFactory.merge({ password }).create()

    const { text } = await supertest(BASE_URL)
        .post(`/user/login`)
        .send({ email, password })
        .expect(200)

    const { token } = JSON.parse(text)

    return {
        id,
        email,
        password,
        token,
    }
}

test.group('Nation', () => {
    test('ensure you can fetch all nations', async (assert) => {
        const count = 10
        await NationFactory.createMany(count)

        const { text } = await supertest(BASE_URL).get('/nations').expect(200)
        const data = JSON.parse(text)

        assert.isArray(data)
        assert.lengthOf(data, count)
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
        const nation = await createNation()
        const { text } = await supertest(BASE_URL).get(`/nations/${nation.oid}`).expect(200)

        const data = JSON.parse(text)
        const serializedNation = nation.toJSON()

        for (const key of Object.keys(serializedNation)) {
            assert.equal(serializedNation[key], data[key])
        }
    })

    test('ensure that updating a nation requires a valid token', async (assert) => {
        const { oid } = await createNation()
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${oid}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that updating a non-existant nation with a valid token fails', async () => {
        const { token } = await createAdmin()

        await supertest(BASE_URL)
            .put(`/nations/${INVALID_NATION_OID}`)
            .set('Authorization', 'Bearer ' + token)
            .expect(404)
    })

    test('ensure that updating a nation with a non-admin token fails', async () => {
        const { token } = await createAdmin()
        const { oid } = await createNation()

        await supertest(BASE_URL)
            .put(`/nations/${oid}`)
            .set('Authorization', 'Bearer ' + token)
            .expect(401)
    })

    test('ensure that updating a nation requires a valid oid with admin permissions', async () => {
        const { id, token } = await createAdmin()
        // Add the admin user id as argument to set the admin user in the created nation
        const { oid } = await createNation(id)

        await supertest(BASE_URL)
            .put(`/nations/${oid}`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
    })
})
