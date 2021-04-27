import test from 'japa'
import path from 'path'
import supertest from 'supertest'
import Nation from 'App/Models/Nation'
import { createStaffUser } from 'App/Utils/Test'
import { BASE_URL, HOSTNAME } from 'App/Utils/Constants'
import { NationFactory } from 'Database/factories/index'
import { TestNationContract, createTestNation, toRelativePath } from 'App/Utils/Test'

const INVALID_NATION_OID = 99999

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
        const nation = await NationFactory.create()
        const { text } = await supertest(BASE_URL).get(`/nations/${nation.oid}`).expect(200)
        const data = JSON.parse(text)

        assert.equal(data.name, nation.name)
        assert.equal(data.short_name, nation.shortName)
        assert.equal(data.description, nation.description)
        assert.equal(data.cover_img_src, nation.coverImgSrc)
        assert.equal(data.icon_img_src, nation.iconImgSrc)
        assert.equal(data.accent_color, nation.accentColor)
    })

    test('ensure a nation does not have a default location if not set to any', async (assert) => {
        const testNation = await createTestNation()

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${testNation.oid}`)
            .set('Authorization', 'Bearer ' + testNation.token)
            .expect(200)

        const data = JSON.parse(text)
        assert.isFalse(data.hasOwnProperty('default_location'))
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
    const coverImagePath = path.join(__dirname, 'data/cover.png')
    const iconImagePath = path.join(__dirname, 'data/icon.png')
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that uploading images requires a valid token', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/upload`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .attach('cover', coverImagePath)
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that updating a nation with a non-admin token fails', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that admins can upload cover image and icon', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .attach('icon', iconImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.cover_img_src)
        assert.isNotNull(data.icon_img_src)

        // Ensure that the uploaded images can be accessed via the specified URL
        await supertest(HOSTNAME).get(toRelativePath(data.icon_img_src)).expect(200)
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(200)
    })

    test('ensure that old uploads are removed', async (assert) => {
        // Upload initial images
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .attach('icon', iconImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.cover_img_src)
        assert.isNotNull(data.icon_img_src)

        await supertest(HOSTNAME).get(toRelativePath(data.icon_img_src)).expect(200)
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(200)

        // Upload new images
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .attach('icon', iconImagePath)
            .expect(200)

        // Ensure that the previously uploaded images have been removed
        await supertest(HOSTNAME).get(toRelativePath(data.icon_img_src)).expect(404)
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(404)
    })

    test('ensure that uploading an image requires an attachment', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ randomData: 'hello' })
            .expect(400)
    })

    test('ensure that uploading images to a non-existant nation fails', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${INVALID_NATION_OID}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(404)
    })
})
