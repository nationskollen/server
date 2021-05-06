import test from 'japa'
import path from 'path'
import supertest from 'supertest'
import Individual from 'App/Models/Individual'
import { BASE_URL } from 'App/Utils/Constants'
import { TestNationContract, createTestNation } from 'App/Utils/Test'

test.group('Individuals fetch', async (group) => {
    let nation: TestNationContract
    const amountOfIndividualsToCreated = 10
    let individualData = {
        name: 'test',
        description: 'long description',
        role: '1Q',
    }

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that you can fetch an individual', async (assert) => {
        const text1 = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data1 = JSON.parse(text1.text)

        const { text } = await supertest(BASE_URL).get(`/individuals/${data1.id}`).expect(200)

        const data = JSON.parse(text)

        assert.equal(data.name, individualData.name)
        assert.equal(data.role, individualData.role)
        assert.equal(data.description, individualData.description)
        assert.equal(data.nation_id, nation.oid)
    })

    test('ensure that you can fetch all individuals', async (assert) => {
        for (let i = 1; i < amountOfIndividualsToCreated; i++) {
            await supertest(BASE_URL)
                .post(`/nations/${nation.oid}/individuals`)
                .set('Authorization', 'Bearer ' + nation.token)
                .send(individualData)
                .expect(200)
        }

        const { text } = await supertest(BASE_URL).get(`/individuals`).expect(200)

        const data = JSON.parse(text)
        assert.lengthOf(data, amountOfIndividualsToCreated)
    })
})

test.group('Individuals create', async (group) => {
    let nation: TestNationContract
    let individualData = {
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
})

test.group('Individuals update', async (group) => {
    let nation: TestNationContract
    let individualData = {
        name: 'test',
        description: 'long description',
        role: '1Q',
    }
    let newIndividualData = {
        name: 'newtest',
        description: 'long veryu description',
        role: '2Q',
    }

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that updating an individual requires a valid token', async () => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/individuals/${data.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(newIndividualData)
            .expect(401)
    })

    test('ensure that updating an individual requires an admin token', async () => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/individuals/${data.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(newIndividualData)
            .expect(401)
    })

    test('ensure that updating an individual is viable', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        const text1 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/individuals/${data.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newIndividualData)
            .expect(200)

        const data2 = JSON.parse(text1.text)

        assert.notEqual(data2.name, data.name)
        assert.notEqual(data2.role, data.role)
        assert.equal(data2.name, newIndividualData.name)
    })
})

test.group('Event delete', async (group) => {
    let nation: TestNationContract
    let individualData = {
        name: 'test',
        description: 'long description',
        role: '1Q',
    }

    group.before(async () => {
        nation = await createTestNation()
        individualData['nation_id'] = nation.oid
    })

    test('ensure that deleting an individual requires a valid token', async () => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/individuals/${data.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(individualData)
            .expect(401)
    })

    test('ensure that deleting an individual requires an admin token', async () => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/individuals/${data.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(individualData)
            .expect(401)
    })

    test('ensure that deleting an individual requires is viable', async () => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/individuals/${data.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)
    })
})

test.group('Event upload', (group) => {
    const coverImagePath = path.join(__dirname, 'data/cover.png')
    let nation: TestNationContract
    let individualData = {
        name: 'test',
        description: 'long description',
        role: '1Q',
    }

    group.before(async () => {
        nation = await createTestNation()
        individualData['nation_id'] = nation.oid
    })

    test('ensure that uploading an individual cover requires a valid token', async () => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals/${data.id}/upload`)
            .set('Authorization', 'Bearer ' + '.token')
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that uploading an individual cover requires an admin token', async () => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals/${data.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that uploading an individual cover is viable', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(individualData)
            .expect(200)

        const data = JSON.parse(text)

        const text1 = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/individuals/${data.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        const data1 = JSON.parse(text1.text)

        assert.isNotNull(data1.cover_img_src)
    })
})
