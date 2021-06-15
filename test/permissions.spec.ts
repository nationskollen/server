import test from 'japa'
import supertest from 'supertest'
import Permission from 'App/Models/Permission'
import PermissionType from 'App/Models/PermissionType'
import User from 'App/Models/User'
import { BASE_URL } from 'App/Utils/Constants'
import { Permissions } from 'App/Utils/Permissions'
import { Days } from 'App/Utils/Time'
import {
    TestNationContract,
    createTestNation,
    createTestPermissionType,
    createTestEvent,
    createTestLocation,
    createTestIndividual,
    createTestNews,
    createTestMenu,
    createTestContact,
    createTestMenuItem,
    createTestUser,
    createTestOpeningHour,
    assignPermissions,
} from 'App/Utils/Test'

test.group('Permissions fetch', (group) => {
    let nation: TestNationContract
    let numberOfPermissionsInSystem: number

    group.before(async () => {
        nation = await createTestNation()

        const { text } = await supertest(BASE_URL)
            .get(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        numberOfPermissionsInSystem = JSON.parse(text).length
    })

    test('ensure we can fetch permissions in system', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .get(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = JSON.parse(text)
        assert.isNotNull(data)
        assert.equal(data.length, numberOfPermissionsInSystem)
    })
})

test.group('Permissions add', async (group) => {
    let nation: TestNationContract
    let user: User

    group.before(async () => {
        nation = await createTestNation()
        user = await createTestUser(nation.oid, false)

        const permissions = await PermissionType.query().where('type', Permissions.Permission)

        await assignPermissions(nation.staffUser, permissions)
        await assignPermissions(nation.adminUser, permissions)
    })

    test('ensure that adding a permission requires a valid token', async () => {
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

        const permissions = await PermissionType.query().where('type', Permissions.Permission)

        await assignPermissions(nation.staffUser, permissions)
        await assignPermissions(nation.adminUser, permissions)
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

test.group('Permissions in action', (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure a staff user with permission >>Events<< can operate accordingly', async () => {
        const event = await createTestEvent(nation.oid)
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.Events)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(200)
    })

    test('ensure a staff user with permission >>Locations<< can operate accordingly', async () => {
        const location = await createTestLocation(nation.oid)
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.Location)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(200)
    })

    test('ensure a staff user with permission >>Individuals<< can operate accordingly', async () => {
        const individual = await createTestIndividual(nation.oid)
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.Individuals)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/individuals/${individual.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(200)
    })

    test('ensure a staff user with permission >>News and messages<< can operate accordingly', async () => {
        const news = await createTestNews(nation.oid)
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ title: 'new name' })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.News)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ title: 'new name' })
            .expect(200)
    })

    test('ensure a staff user with permission >>Menus<< can operate accordingly', async () => {
        const location = await createTestLocation(nation.oid)
        const menu = await createTestMenu(nation.oid, location.id)
        await supertest(BASE_URL)
            .put(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.Menus)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(200)
    })

    test('ensure a staff user with permission >>Menu Items<< can operate accordingly', async () => {
        const location = await createTestLocation(nation.oid)
        const menu = await createTestMenu(nation.oid, location.id)
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .put(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.MenuItem)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ name: 'new name' })
            .expect(200)
    })

    test('ensure a staff user with permission >>Contact<< can operate accordingly', async () => {
        const contact = await createTestContact(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ email: 'fadde@faddson.se' })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.Contact)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ email: 'fadde@faddson.se' })
            .expect(200)
    })

    test('ensure a staff user with permission >>Activity<< can operate accordingly', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ change: 20 })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.Activity)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ change: 20 })
            .expect(200)
    })

    test('ensure a staff user with permission >>OpeningHours<< can operate accordingly', async () => {
        const location = await createTestLocation(nation.oid)
        const openingHour = await createTestOpeningHour(location.id)
        const newData = {
            is_open: !openingHour.isOpen,
            day: openingHour.id === Days.Monday ? Days.Friday : Days.Monday,
            open: '10:00',
            close: '20:00',
        }

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(newData)
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.OpeningHours)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(newData)
            .expect(200)
    })

    test('ensure a staff user with permission >>User<< can operate accordingly', async () => {
        const user = await createTestUser(nation.oid, false)

        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ fullname: 'fadde' })
            .expect(401)

        const permissions = await PermissionType.query().where('type', Permissions.User)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ fullname: 'fadde' })
            .expect(401)

        // will still not allow us to do changes even with a permission.
        // This is because of design that we only allow nation admins with
        // to be able to get access to users.

        await supertest(BASE_URL)
            .put(`/users/${user.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ fullname: 'fadde' })
            .expect(200)
    })

    test('ensure a staff user with permission >>Permissions<< can operate accordingly', async () => {
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

        const permissions = await PermissionType.query().where('type', Permissions.Permission)
        await assignPermissions(nation.staffUser, permissions)

        await supertest(BASE_URL)
            .post(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(401)
        // Can only be performed by nation admins.

        await supertest(BASE_URL)
            .post(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                user_id: user.id,
                permission_type_id: permission.id,
            })
            .expect(200)
    })
})
