import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/User'
import Nation from 'App/Models/Nation'
import { NationFactory, UserFactory } from 'Database/factories/index'
import { BASE_URL } from 'App/Utils/Constants'

const INVALID_NATION_OID = 9999999999

async function getToken() {
    // Create new user
    const password = 'password123'
    const user = await UserFactory.merge({ password }).create()

    const { text } = await supertest(BASE_URL)
        .post(`/user/login`)
        .send({
            email: user.email,
            password,
        })
        .expect(200)

    return JSON.parse(text).token
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
        const nation = await NationFactory.create()
        const { text } = await supertest(BASE_URL).get(`/nations/${nation.oid}`).expect(200)

        const data = JSON.parse(text)
        const serializedNation = nation.toJSON()

        for (const key of Object.keys(serializedNation)) {
            assert.equal(serializedNation[key], data[key])
        }
    })

    test('ensure that updating a nation requires a valid token', async (assert) => {
        const nation = await NationFactory.create()

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that updating a nation requires a valid oid', async (assert) => {
        const token = await getToken()
        await supertest(BASE_URL)
            .put(`/nations/${INVALID_NATION_OID}`)
            .set('Authorization', 'Bearer ' + token)
            .expect(404)
    })
})
