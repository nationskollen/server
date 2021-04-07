import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { TestNationContract, createTestNation, createTestLocation } from 'App/Utils/Test'

test.group('Locations create', async (group) => {
    let nation: TestNationContract
    let locationData = {
        name: 'testPlats',
        description: 'Lunchplats',
        address: 'Dragarbrunnsgatan 27B',
        max_capacity: 250,
    }

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that creating a location requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(locationData)
            .expect(401)
    })

    test('ensure that creating a location requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(locationData)
            .expect(401)
    })

    test('ensure that admins can create a location', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(locationData)
            .expect(200)

        const data = JSON.parse(text)

        assert.containsAllDeepKeys(data, Object.keys(locationData))
    })
})

test.group('Locations activity handling', async (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that updating a location requires a valid token', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send({
                name: 'TheNew',
            })
            .expect(401)
    })

    test('ensure that updating a location requires an admin token', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                name: 'TheNew',
            })
            .expect(401)
    })

    test('ensure that admins can update a location', async (assert) => {
        const location = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'TheNew',
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.name, 'TheNew')
    })

    test('ensure that admins can update a location max_capacity', async (assert) => {
        const location = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                max_capacity: 500,
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.max_capacity, 500)
    })

    test('ensure that admins cannot update a location falsely', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                max_capacity: '500a',
            })
            .expect(422)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 500,
            })
            .expect(422)
    })

    test('ensure that it is not possible to update a non-existing location', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/999999999999`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                name: 'TheNew',
            })
            .expect(404)
    })
})

test.group('Location deletion', async (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that deletion of a location requires a valid token', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)
    })

    test('ensure that deletion of a location requires an admin token', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that deletion of a location is viable', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)
    })

    test('ensure that deletion of a non-existing location is not viable', async () => {
        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/999999999999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })
})
