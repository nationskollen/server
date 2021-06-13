import test from 'japa'
import supertest from 'supertest'
import Permission from 'App/Models/Permission'
import User from 'App/Models/User'
import { BASE_URL } from 'App/Utils/Constants'
import {
    TestNationContract,
    createTestNation,
    createTestPermissionType,
    createTestUser,
} from 'App/Utils/Test'

test.group('Permissions fetch', (group) => {
    let nation: TestNationContract
    const numberOfPermissionsInTest = 5

    group.before(async () => {
        nation = await createTestNation()
        for (let i = 0; i < numberOfPermissionsInTest; i++) {
            await createTestPermissionType()
        }
    })

    test('ensure we can fetch permissions in system', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .get(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = JSON.parse(text)
        assert.isNotNull(data)
        assert.equal(data.length, numberOfPermissionsInTest)
    })
})

test.group('Permissions add', async (group) => {
    let nation: TestNationContract
    let user: User

    group.before(async () => {
        nation = await createTestNation()
        user = await createTestUser(nation.oid, false)
    })

    test('ensure that adding a permission requires a valid token', async () => {
        const user = await createTestUser(nation.oid, false)
        const permission = await createTestPermissionType()

        await supertest(BASE_URL)
            .post(`/permissions`)
            .set('Authorization', 'Bearer ' + 'invalid token')
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(401)
    })

    test('ensure that adding a permission requires an admin token', async () => {
        const user = await createTestUser(nation.oid, false)
        const permission = await createTestPermissionType()

        await supertest(BASE_URL)
            .post(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(401)
    })

    test('ensure we can add a user permission', async (assert) => {
        const permission = await createTestPermissionType()

        const { text } = await supertest(BASE_URL)
            .post(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(200)

        const data = JSON.parse(text)

        const userPermission = await Permission.findBy('user_id', data.id)

        assert.exists(userPermission)
        assert.equal(userPermission?.userId, user.id)
    })

    test('ensure we can add a user multiple permission(s)', async (assert) => {
        const permissionType = await createTestPermissionType()
        const permissionType2 = await createTestPermissionType()
        const permissionType3 = await createTestPermissionType()
        const permissionTypes = [permissionType, permissionType2, permissionType3]
        const tmpUser = await createTestUser(nation.oid, false)

        for (const { id } of permissionTypes) {
            await supertest(BASE_URL)
                .post(`/permissions`)
                .set('Authorization', 'Bearer ' + nation.token)
                .send({
                    user_id: tmpUser.id,
                    permission_type_id: id,
                })
                .expect(200)
        }

        const { text } = await supertest(BASE_URL)
            .get(`/users/${tmpUser.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = JSON.parse(text)

        assert.equal(permissionTypes[0].id, data.permissions[0].permission_type_id)
        assert.equal(permissionTypes[1].id, data.permissions[1].permission_type_id)
        assert.equal(permissionTypes[2].id, data.permissions[2].permission_type_id)
    })

    test('ensure we cannot add existing permission(s) from a user', async () => {
        const permission = await createTestPermissionType()
        await supertest(BASE_URL)
            .delete(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(400)
    })
})

test.group('Permissions remove', async (group) => {
    let nation: TestNationContract
    let user: User

    group.before(async () => {
        nation = await createTestNation()
        user = await createTestUser(nation.oid, false)
    })

    test('ensure that removing a permission requires a valid token', async () => {
        const user = await createTestUser(nation.oid, false)
        const permission = await createTestPermissionType()

        await supertest(BASE_URL)
            .delete(`/permissions`)
            .set('Authorization', 'Bearer ' + 'invalid token')
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(401)
    })

    test('ensure that removing a permission requires an admin token', async () => {
        const user = await createTestUser(nation.oid, false)
        const permission = await createTestPermissionType()

        await supertest(BASE_URL)
            .delete(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(401)
    })

    test('ensure we can remove permissions from a user', async (assert) => {
        const permission = await createTestPermissionType()

        await supertest(BASE_URL)
            .post(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(200)

        await supertest(BASE_URL)
            .delete(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .get(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = JSON.parse(text)

        const userPermission = await Permission.findBy('user_id', user.id)
        assert.notExists(userPermission)

        for (const { id } of data.permissions) {
            assert.notEqual(id, permission.id)
        }
    })

    test('ensure we cannot remove non-exists permission from a user', async () => {
        const permission = await createTestPermissionType()
        await supertest(BASE_URL)
            .delete(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(400)
    })
})
