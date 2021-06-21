import test from 'japa'
import User from 'App/Models/User'
import PermissionType from 'App/Models/PermissionType'
import path from 'path'
import supertest from 'supertest'
import * as faker from 'faker'
import { BASE_URL, HOSTNAME } from 'App/Utils/Constants'
import { Permissions } from 'App/Utils/Permissions'
import { NationFactory } from 'Database/factories/index'
import {
    TestNationContract,
    createTestNation,
    createTestUser,
    createStaffUser,
    toRelativePath,
    assignPermissions,
} from 'App/Utils/Test'

test.group('User(s) fetch', (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure we can fetch users', async (assert) => {
        const tmpNation = await NationFactory.create()
        const user = await createStaffUser(tmpNation.oid, true)
        await createTestUser(tmpNation.oid, false)

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${tmpNation.oid}/users`)
            .set('Authorization', 'Bearer ' + user.token)
            .expect(200)

        const data = JSON.parse(text)
        assert.isNotNull(data)
        assert.equal(data.data.length, 2)
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
        assert.equal(data.full_name, user.fullName)
        assert.equal(data.email, user.email)
    })

    test('ensure we cannot fetch a user from a different nation', async () => {
        const nation2 = await createTestNation()
        const user = await createTestUser(nation2.oid, false)

        await supertest(BASE_URL)
            .get(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(401)
    })

    test('ensure we can fetch an admin user ', async () => {
        const user = await createTestUser(nation.oid, true)

        await supertest(BASE_URL)
            .get(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(200)

        await supertest(BASE_URL)
            .get(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)
    })

    test('ensure that fetching a non-existant user fails', async () => {
        const nation = await createTestNation()

        await supertest(BASE_URL)
            .get(`/users/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that fetching while not authenticated fails', async () => {
        const nation = await createTestNation()

        await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + 'invalid token')
            .expect(401)
    })
})

test.group('User(s) create', async (group) => {
    let nation: TestNationContract
    const userData = {
        full_name: faker.name.firstName(),
        email: faker.unique(faker.internet.email),
        password: faker.internet.password(),
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

    test('ensure that creating a user requires valid permissions', async () => {
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
        assert.equal(data.full_name, userData.full_name)
        assert.equal(data.email, userData.email)
    })

    test('ensure that an admin cannot create user(s) for the incorrect nation', async () => {
        const nation2 = await createTestNation()

        await supertest(BASE_URL)
            .post(`/nations/${nation2.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(userData)
            .expect(401)
    })

    test('ensure that creating a user in a nation with the same email as a user in another nation is not possible', async () => {
        const nation2 = await createTestNation()
        const email = faker.unique(faker.internet.email)

        await supertest(BASE_URL)
            .post(`/nations/${nation2.oid}/users`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .send({
                full_name: 'nation2 fadde',
                email: email,
                password: 'asdfasdfasdf',
            })
            .expect(200)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                full_name: 'nation2 fadde',
                email: email,
                password: 'asdfasdfasdf',
            })
            .expect(422)
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
                full_name: 'hello',
                email: 'hello',
                password: '123412341234',
                nationAdmin: '1234',
            })
            .expect(422)
    })

    test('ensure a staff user with permission >>User<< can create users', async () => {
        const tmpUser = await createStaffUser(nation.oid, false)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + tmpUser.token)
            .send({
                full_name: 'fadde',
                email: 'testPermissionCreateUser@mail.se',
                password: 'asdfasdf',
            })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.Users)
        await assignPermissions(tmpUser.user, permissions)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + tmpUser.token)
            .send({
                full_name: 'fadde',
                email: 'testPermissionCreateUser@mail.se',
                password: 'asdfasdf',
            })
            .expect(200)
    })
})

test.group('User(s) update', async (group) => {
    let nation: TestNationContract
    let adminUser: User
    const userData = {
        full_name: faker.name.firstName(),
        email: faker.unique(faker.internet.email),
        password: faker.internet.password(),
    }

    group.before(async () => {
        nation = await createTestNation()
        adminUser = await createTestUser(nation.oid, true)
    })

    test('ensure that updating a user requires a valid token', async () => {
        const user = await createTestUser(nation.oid, false)

        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(userData)
            .expect(401)
    })

    test('ensure that updating a user requires valid permissions', async () => {
        const user = await createTestUser(nation.oid, false)

        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(userData)
            .expect(401)
    })

    test('ensure that admins can update a user', async (assert) => {
        const user = await createTestUser(nation.oid, false)

        const { text } = await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(userData)
            .expect(200)

        const data = JSON.parse(text)
        assert.notDeepEqual(data, user)
    })

    test('ensure that staff can update a user with correct permissions', async (assert) => {
        const user = await createTestUser(nation.oid, false)
        const tmpStaff = await createStaffUser(nation.oid, false)

        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + tmpStaff.token)
            .send(userData)
            .expect(401)

        const permissiontypes = await PermissionType.query().where('type', Permissions.Users)
        await assignPermissions(tmpStaff.user, permissiontypes)

        const { text } = await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + tmpStaff.token)
            .send({
                ...userData,
                email: faker.unique(faker.internet.email),
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.notDeepEqual(data, user)
    })

    test('ensure that staff cannot update a user with incorrect/missing permissions', async () => {
        const user = await createTestUser(nation.oid, false)

        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                ...userData,
                email: faker.unique(faker.internet.email),
            })
            .expect(401)
    })

    test('ensure that updating a user with an email that already exists fails', async () => {
        const user = await createTestUser(nation.oid, false)
        const tmpStaff = await createStaffUser(nation.oid, false)
        const permissiontypes = await PermissionType.query().where('type', Permissions.Users)
        await assignPermissions(tmpStaff.user, permissiontypes)

        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + tmpStaff.token)
            .send({
                email: userData.email,
            })
            .expect(422)
    })

    test('ensure that an admin cannot update user for the incorrect nation', async () => {
        const user = await createTestUser(nation.oid, false)
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
            .send({ full_name: 'asdf' })
            .expect(401)
    })
})

test.group('User(s) upload', (group) => {
    const avatarImagePath = path.join(__dirname, 'data/cover.png')
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
            .attach('avatar', avatarImagePath)
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that uploading to a user with no permissions fails', async () => {
        await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('avatar', avatarImagePath)
            .expect(401)
    })

    test('ensure that admins can upload avatar images', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('avatar', avatarImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.avatar_image_src)

        // Ensure that the uploaded images can be accessed via the specified URL
        await supertest(HOSTNAME).get(toRelativePath(data.avatar_img_src)).expect(200)
    })

    test('ensure that a user can upload avatar images to itself', async (assert) => {
        const tmpUser = await createStaffUser(nation.oid, false)

        const { text } = await supertest(BASE_URL)
            .post(`/users/${tmpUser.user.id}/upload`)
            .set('Authorization', 'Bearer ' + tmpUser.token)
            .attach('avatar', avatarImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.avatar_image_src)

        // Ensure that the uploaded images can be accessed via the specified URL
        await supertest(HOSTNAME).get(toRelativePath(data.avatar_img_src)).expect(200)
    })

    test('ensure that staff with permission can upload avatar images users', async (assert) => {
        const tmpUser = await createStaffUser(nation.oid, false)
        const tmpStaff = await createStaffUser(nation.oid, false)

        await supertest(BASE_URL)
            .post(`/users/${tmpUser.user.id}/upload`)
            .set('Authorization', 'Bearer ' + tmpStaff.token)
            .attach('avatar', avatarImagePath)
            .expect(401)

        const permissiontypes = await PermissionType.query().where('type', Permissions.Users)
        await assignPermissions(tmpStaff.user, permissiontypes)

        const { text } = await supertest(BASE_URL)
            .post(`/users/${tmpUser.user.id}/upload`)
            .set('Authorization', 'Bearer ' + tmpStaff.token)
            .attach('avatar', avatarImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.avatar_image_src)

        // Ensure that the uploaded images can be accessed via the specified URL
        await supertest(HOSTNAME).get(toRelativePath(data.avatar_img_src)).expect(200)
    })

    test('ensure that old uploads are removed', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('avatar', avatarImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.avatar_image_src)

        await supertest(HOSTNAME).get(toRelativePath(data.avatar_img_src)).expect(200)

        // Upload new images
        await supertest(BASE_URL)
            .post(`/users/${user.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('avatar', avatarImagePath)
            .expect(200)

        // Ensure that the previously uploaded images have been removed
        await supertest(HOSTNAME).get(toRelativePath(data.avatar_img_src)).expect(404)
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
            .attach('avatar', avatarImagePath)
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

    test('ensure that deleting user with no permission fails', async () => {
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

    test('ensure that admins can delete themselves', async () => {
        const user = await createStaffUser(nation.oid, true)

        await supertest(BASE_URL)
            .delete(`/users/${user.user.id}`)
            .set('Authorization', 'Bearer ' + user.token)
            .expect(401)

        await supertest(BASE_URL)
            .get(`/users/${user.user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)
    })

    test('ensure that staff users with the appropriate permissions can not delete themselves', async () => {
        const tmpStaff = await createStaffUser(nation.oid, false)
        const permissiontypes = await PermissionType.query().where('type', Permissions.Users)
        await assignPermissions(tmpStaff.user, permissiontypes)

        await supertest(BASE_URL)
            .delete(`/users/${tmpStaff.user.id}`)
            .set('Authorization', 'Bearer ' + tmpStaff.token)
            .expect(401)

        await supertest(BASE_URL)
            .get(`/users/${tmpStaff.user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)
    })

    test('ensure that admins cannot delete an admin user', async () => {
        const user = await createTestUser(nation.oid, true)

        await supertest(BASE_URL)
            .delete(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(401)
    })

    test('ensure that staff with sufficient permissions can delete an admin', async () => {
        const user = await createTestUser(nation.oid, true)
        const tmpStaff = await createStaffUser(nation.oid, false)
        const permissiontypes = await PermissionType.query().where('type', Permissions.Users)
        await assignPermissions(tmpStaff.user, permissiontypes)

        await supertest(BASE_URL)
            .delete(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + tmpStaff.token)
            .expect(401)
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

    test('ensure a staff user with permission >>User<< can delete users', async () => {
        const tmpUser = await createStaffUser(nation.oid, false)
        const user = await createTestUser(nation.oid, false)

        await supertest(BASE_URL)
            .delete(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + tmpUser.token)
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.Users)
        await assignPermissions(tmpUser.user, permissions)

        await supertest(BASE_URL)
            .delete(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + tmpUser.token)
            .expect(200)
    })
})
