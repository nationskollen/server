import test from 'japa'
import User from 'App/Models/User'
import path from 'path'
import supertest from 'supertest'
import { BASE_URL, HOSTNAME } from 'App/Utils/Constants'
import {
    TestNationContract,
    createTestNation,
    createTestUser,
    toRelativePath,
} from 'App/Utils/Test'

test.group('User(s) fetch', (group) => {
    let nation: TestNationContract
    const usersToCreate: number = 3

    group.before(async () => {
        nation = await createTestNation()

        for (let i = 0; i < usersToCreate; i++) {
            await createTestUser(nation.oid, false)
        }
    })

    test('ensure we can fetch users', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = JSON.parse(text)
        assert.isNotNull(data)
        assert.equal(data.data.length, 5)
    })

    test('ensure we can paginate users', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/users?page=1&amount=1`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = JSON.parse(text)
        assert.isNotNull(data)
        assert.equal(data.data.length, 1)
    })

    test('ensure we can fetch a user', async (assert) => {
        const user = await createTestUser(nation.oid, false)

        const { text } = await supertest(BASE_URL)
            .get(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.fullname, user.fullname)
        assert.equal(data.email, user.email)
        assert.equal(data.nation_admin, user.nationAdmin)
    })

    test('ensure we cannot fetch a user from a different nation', async () => {
        const nation2 = await createTestNation()
        const user = await createTestUser(nation2.oid, false)

        await supertest(BASE_URL)
            .get(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(401)
    })

    test('ensure we cannot fetch a another admin user ', async () => {
        const user = await createTestUser(nation.oid, true)

        await supertest(BASE_URL)
            .get(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(401)
    })

    test('ensure that fetching a non-existant user fails', async () => {
        const nation = await createTestNation()

        await supertest(BASE_URL)
            .get(`/users/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })
})

test.group('News create', async (group) => {
    let nation: TestNationContract
    const userData = {
        fullname: 'UserTest!!!',
        email: 'test@user.se',
        password: 'Loremipsum',
        nationAdmin: false,
    }

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that creating a user requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(userData)
            .expect(401)
    })

    test('ensure that creating a user requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(userData)
            .expect(401)
    })

    test('ensure that admins can create a user', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(userData)
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.fullname, userData.fullname)
        assert.equal(data.email, userData.email)
        assert.equal(data.nation_admin, userData.nationAdmin)
        assert.isFalse(data.nation_admin)
    })

    test('ensure that an admin cannot create user(s) for the incorrect nation', async () => {
        const nation2 = await createTestNation()

        await supertest(BASE_URL)
            .post(`/nations/${nation2.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(userData)
            .expect(401)
    })

    test('ensure that validation for creating user(s) works', async () => {
        // Password length less than 8 for example
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                password: '1234',
            })
            .expect(422)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                fullname: 'hello',
                email: 'hello',
                password: '123412341234',
                nationAdmin: '1234',
            })
            .expect(422)
    })
})

test.group('User(s) update', async (group) => {
    let nation: TestNationContract
    let user: User
    let adminUser: User
    const userData = {
        fullname: 'UserTest!!!',
        email: 'test@user.se',
        password: 'Loremipsum',
        nationAdmin: false,
    }

    group.before(async () => {
        nation = await createTestNation()
        user = await createTestUser(nation.oid, false)
        adminUser = await createTestUser(nation.oid, true)
    })

    test('ensure that updating a user requires a valid token', async () => {
        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(userData)
            .expect(401)
    })

    test('ensure that updating a user requires an admin token', async () => {
        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(userData)
            .expect(401)
    })

    test('ensure that admins can update a user', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(userData)
            .expect(200)

        const data = JSON.parse(text)
        assert.notDeepEqual(data, user)
    })

    test('ensure that an admin cannot update user for the incorrect nation', async () => {
        const nation2 = await createTestNation()

        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .send(userData)
            .expect(401)
    })

    test('ensure that updating a non-existant user fails', async () => {
        await supertest(BASE_URL)
            .put(`/users/999999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(userData)
            .expect(404)
    })

    test('ensure that an admin cannot update another admin', async () => {
        await supertest(BASE_URL)
            .put(`/users/${adminUser.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(userData)
            .expect(401)
    })
})

test.group('User(s) upload', (group) => {
    const coverImagePath = path.join(__dirname, 'data/cover.png')
    let nation: TestNationContract
    let user: User

    group.before(async () => {
        nation = await createTestNation()
        user = await createTestUser(nation.oid, false)
    })

    test('ensure that uploading images requires a valid token', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .attach('cover', coverImagePath)
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that uploading to a user with a non-admin token fails', async () => {
        await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that admins can upload cover images', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.cover_img_src)

        // Ensure that the uploaded images can be accessed via the specified URL
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(200)
    })

    test('ensure that old uploads are removed', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.cover_img_src)

        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(200)

        // Upload new images
        await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        // Ensure that the previously uploaded images have been removed
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(404)
    })

    test('ensure that uploading an image requires an attachment', async () => {
        await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ randomData: 'hello' })
            .expect(400)
    })

    test('ensure that uploading images to a non-existant user fails', async () => {
        await supertest(BASE_URL)
            .post(`/users/99999/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(404)
    })
})

test.group('User(s) Deletion', (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that deleting user requires a valid token', async (assert) => {
        const user = await createTestUser(nation.oid, false)

        const { text } = await supertest(BASE_URL)
            .delete(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that deleting user with a non-admin token fails', async () => {
        const user = await createTestUser(nation.oid, false)

        await supertest(BASE_URL)
            .delete(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that admins can delete a user', async () => {
        const user = await createTestUser(nation.oid, false)

        await supertest(BASE_URL)
            .delete(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await supertest(BASE_URL)
            .get(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that deleting non-existant user(s) fails', async () => {
        await supertest(BASE_URL)
            .delete(`/users/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that an admin cannot delete a user for the incorrect nation', async () => {
        const nation2 = await createTestNation()
        const user = await createTestUser(nation.oid, false)

        await supertest(BASE_URL)
            .delete(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .expect(401)
    })
})
