import test from 'japa'
import path from 'path'
import supertest from 'supertest'
import Individual from 'App/Models/Individual'
import { BASE_URL } from 'App/Utils/Constants'
import { TestNationContract, createTestNation, createTestIndividual } from 'App/Utils/Test'

test.group('Individuals fetch', async (group) => {
    let nation: TestNationContract
    let individual: Individual
    const amountOfIndividualsToCreated = 3

    group.before(async () => {
        nation = await createTestNation()
        individual = await createTestIndividual(nation.oid)
    })

    test('ensure that you can fetch a single individual', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/individuals/${individual.id}`).expect(200)

        const data = JSON.parse(text)

        assert.equal(data.name, individual.name)
        assert.equal(data.role, individual.role)
        assert.equal(data.description, individual.description)
        assert.equal(data.nation_id, nation.oid)
    })

    test('ensure that you can fetch all individuals in a nation', async (assert) => {
        for (let i = 1; i < amountOfIndividualsToCreated; i++) {
            await createTestIndividual(nation.oid)
        }

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/individuals`)
            .expect(200)

        const data = JSON.parse(text)
        assert.lengthOf(data, amountOfIndividualsToCreated)
    })

    test('ensure that you cannot fetch all individuals in invalid nation oid', async () => {
        await supertest(BASE_URL).get(`/nations/99999999/individuals`).expect(404)
    })

    test('ensure that you cannot fetch an individual with invalid ID', async () => {
        await supertest(BASE_URL).get(`/individuals/99999999`).expect(404)
    })
})

test.group('Individuals create', async (group) => {
    let nation: TestNationContract
    const individualData = {
        name: 'test',
        description: 'long description',
        role: '1Q',
    }

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that creating an individual requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(individualData)
            .expect(401)
    })

    test('ensure that creating an individual requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(individualData)
            .expect(401)
    })

    test('ensure that creating an individual is viable', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        assert.equal(data.name, individualData.name)
        assert.equal(data.role, individualData.role)
        assert.equal(data.nation_id, nation.oid)
    })

    test('ensure that creating an individual must have specified fields', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                role: 'description',
                description: 'asdfasdf',
            })
            .expect(422)
    })

    test('ensure that creating an individual as admin for a nation is not able to create an individual for another nation', async () => {
        const nation2 = await createTestNation()

        await supertest(BASE_URL)
            .post(`/nations/${nation2.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(401)
    })
})

test.group('Individuals update', async (group) => {
    let nation: TestNationContract
    let individual: Individual
    const newIndividualData = {
        name: 'newtest',
        description: 'long veryu description',
        role: '2Q',
    }

    group.before(async () => {
        nation = await createTestNation()
        individual = await createTestIndividual(nation.oid)
    })

    test('ensure that updating an individual requires a valid token', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(newIndividualData)
            .expect(401)
    })

    test('ensure that updating an individual requires an admin token', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(newIndividualData)
            .expect(401)
    })

    test('ensure that updating an individual is viable', async (assert) => {
        const text1 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newIndividualData)
            .expect(200)

        const data2 = JSON.parse(text1.text)

        assert.notEqual(data2.name, individual.name)
        assert.notEqual(data2.role, individual.role)
        assert.equal(data2.name, newIndividualData.name)
    })

    test('ensure that updating an individual only applies to admin of the same nation', async () => {
        const nation2 = await createTestNation()
        const individual2 = await createTestIndividual(nation2.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation2.oid}/individuals/${individual2.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(newIndividualData)
            .expect(401)
    })
})

test.group('Individual delete', async (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that deleting an individual requires a valid token', async () => {
        const individual = await createTestIndividual(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)
    })

    test('ensure that deleting an individual requires an admin token', async () => {
        const individual = await createTestIndividual(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that deleting an individual requires is viable', async () => {
        const individual = await createTestIndividual(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)
    })

    test('ensure that deleting an individual requires an existing individual', async () => {
        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/individuals/99999999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that deleting an individual requires an existing nation', async () => {
        const individual = await createTestIndividual(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/99999999/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that deleting an individual truly removes it by trying to fetchi it', async () => {
        const individual = await createTestIndividual(nation.oid)
        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await supertest(BASE_URL)
            .get(`/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that deleting an individual is only viable to given admins of the same nation', async () => {
        const nation2 = await createTestNation()
        const individual = await createTestIndividual(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .expect(401)
    })
})

test.group('Individual upload', (group) => {
    let nation: TestNationContract
    const coverImagePath = path.join(__dirname, 'data/cover.png')

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that uploading an individual cover requires a valid token', async () => {
        const individual = await createTestIndividual(nation.oid)

        await supertest(BASE_URL)
            .post(`/individuals/${individual.id}/upload`)
            .set('Authorization', 'Bearer ' + '.token')
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that uploading an individual cover requires an admin token', async () => {
        const individual = await createTestIndividual(nation.oid)

        await supertest(BASE_URL)
            .post(`/individuals/${individual.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that uploading an individual cover is viable', async (assert) => {
        const individual = await createTestIndividual(nation.oid)

        const text1 = await supertest(BASE_URL)
            .post(`/individuals/${individual.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('profile', coverImagePath)
            .expect(200)

        const data1 = JSON.parse(text1.text)

        assert.isNotNull(data1.cover_img_src)
    })

    test('ensure that uploading an individual cover is viable only by a given nation admin and not other nation admin', async () => {
        const nation2 = await createTestNation()
        const individual = await createTestIndividual(nation.oid)

        await supertest(BASE_URL)
            .post(`/individuals/${individual.id}/upload`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .attach('profile', coverImagePath)
            .expect(401)
    })

    test('ensure that uploading is only viable to existing individuals', async () => {
        await supertest(BASE_URL)
            .post(`/individuals/99999999/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('profile', coverImagePath)
            .expect(404)
    })
})
