import test from 'japa'
import supertest from 'supertest'
import Menu from 'App/Models/Menu'
import PermissionType from 'App/Models/PermissionType'
import { Permissions } from 'App/Utils/Permissions'
import Location from 'App/Models/Location'
import { BASE_URL } from 'App/Utils/Constants'
import {
    createTestMenu,
    createTestNation,
    createTestLocation,
    TestNationContract,
    assignPermissions,
} from 'App/Utils/Test'

test.group('Menu fetch', async (group) => {
    let nation: TestNationContract
    let location: Location
    let menuOne: Menu
    let permissions: Array<PermissionType>

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
        menuOne = await createTestMenu(nation.oid, location.id)
        await createTestMenu(nation.oid, location.id)

        permissions = await PermissionType.query().where('type', Permissions.Menus)

        await assignPermissions(nation.adminUser, permissions)
    })

    test('ensure that you can fetch all menus of a location', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .get(`/locations/${location.id}/menus`)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotEmpty(data)
        assert.lengthOf(data, 2)
    })

    test('ensure that it returns an empty array if the location has no menus', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .get(`/locations/${testLocation.id}/menus`)
            .expect(200)

        const data = JSON.parse(text)

        assert.isEmpty(data)
        assert.lengthOf(data, 0)
    })

    test('ensure that you can fetch a single menu', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/menus/${menuOne.id}`).expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.name, menuOne.name)
        assert.deepEqual(data.hidden, menuOne.hidden)
    })

    test('ensure that you can fetch menu(s) by filtering for non-hidden menus', async (assert) => {
        const tmpNation = await createTestNation()
        const tmpLocation = await createTestLocation(tmpNation.oid)

        await assignPermissions(tmpNation.adminUser, permissions)

        await createTestMenu(tmpNation.oid, tmpLocation.id)
        await createTestMenu(tmpNation.oid, tmpLocation.id)
        await createTestMenu(tmpNation.oid, tmpLocation.id)
        await createTestMenu(tmpNation.oid, tmpLocation.id)
        await createTestMenu(tmpNation.oid, tmpLocation.id)

        const numberOfNonHiddenMenus = 5

        const hiddenMenu = {
            name: 'Frukost',
            hidden: true,
        }

        const text2 = await supertest(BASE_URL)
            .post(`/locations/${tmpLocation.id}/menus`)
            .set('Authorization', 'Bearer ' + tmpNation.token)
            .send(hiddenMenu)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .get(`/locations/${tmpLocation.id}/menus?hidden=false`)
            .expect(200)

        const data = JSON.parse(text)
        const data2 = JSON.parse(text2.text)
        assert.lengthOf(data, numberOfNonHiddenMenus)
        for (const menu of data) {
            assert.notDeepEqual(menu.id, data2.id)
        }
    })

    test('ensure that you can fetch menu(s) by filtering for hidden menus', async (assert) => {
        const tmpNation = await createTestNation()
        const tmpLocation = await createTestLocation(tmpNation.oid)
        const numberOfHiddenMenus = 1

        await assignPermissions(tmpNation.adminUser, permissions)

        const hiddenMenu = {
            name: 'Frukost',
            hidden: true,
        }

        const text2 = await supertest(BASE_URL)
            .post(`/locations/${tmpLocation.id}/menus`)
            .set('Authorization', 'Bearer ' + tmpNation.token)
            .send(hiddenMenu)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .get(`/locations/${tmpLocation.id}/menus?hidden=true`)
            .expect(200)

        const data = JSON.parse(text)
        const data2 = JSON.parse(text2.text)
        assert.lengthOf(data, numberOfHiddenMenus)
        assert.equal(data[0].id, data2.id)
    })
})

test.group('Menu create', async (group) => {
    const menuData = {
        name: 'Frukost',
        hidden: false,
    }

    let nation: TestNationContract
    let location: Location
    let permissions: Array<PermissionType>

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)

        permissions = await PermissionType.query().where('type', Permissions.Menus)

        await assignPermissions(nation.adminUser, permissions)
    })

    test('ensure that creating menus requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/menus`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(menuData)
            .expect(401)
    })

    test('ensure that creating menus requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/menus`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(menuData)
            .expect(401)
    })

    test('ensure that admins can create menus', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/locations/${location.id}/menus`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(menuData)
            .expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.name, menuData.name)
        assert.deepEqual(data.hidden, menuData.hidden)
        assert.deepEqual(data.nation_id, nation.oid)
        assert.deepEqual(data.location_id, location.id)
    })

    test('ensure that invalid properties are removed', async () => {
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/menus`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                nationId: 1000,
                locationId: 99,
                description: 'hello',
            })
            .expect(422)
    })

    test('ensure that name is required', async () => {
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/menus`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                hidden: true,
            })
            .expect(422)
    })

    test('ensure that name must be a string', async () => {
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/menus`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 123,
                hidden: true,
            })
            .expect(422)
    })

    test('ensure that visibility status must be a boolean', async () => {
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/menus`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'asd',
                hidden: 'asd',
            })
            .expect(422)
    })

    test('ensure that you can not create a menu on a location of another nation', async () => {
        const anotherNation = await createTestNation()
        const anotherLocation = await createTestLocation(anotherNation.oid)

        await supertest(BASE_URL)
            .post(`/locations/${anotherLocation.id}/menus`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'asd',
                hidden: 'asd',
            })
            .expect(401)
    })
})

test.group('Menu update', async (group) => {
    const menuData = {
        name: 'New name',
    }

    let nation: TestNationContract
    let location: Location
    let permissions: Array<PermissionType>

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)

        permissions = await PermissionType.query().where('type', Permissions.Menus)

        await assignPermissions(nation.adminUser, permissions)
    })

    test('ensure that updating menus requires a valid token', async () => {
        const menu = await createTestMenu(nation.oid, location.id)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(menuData)
            .expect(401)
    })

    test('ensure that update menus requires an admin token', async () => {
        const menu = await createTestMenu(nation.oid, location.id)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(menuData)
            .expect(401)
    })

    test('ensure that admins can update menus', async (assert) => {
        const menu = await createTestMenu(nation.oid, location.id)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                ...menuData,
                hidden: !menu.hidden,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.name, menuData.name)
        assert.deepEqual(data.hidden, !menu.hidden)
    })

    test('ensure that invalid properties are removed', async () => {
        const menu = await createTestMenu(nation.oid, location.id)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                nationId: 123,
                locationId: 20000,
                test: '123123',
            })
            .expect(400)
    })

    test('ensure that invalid properties are removed', async () => {
        const menu = await createTestMenu(nation.oid, location.id)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                nationId: 123,
                locationId: 20000,
                test: '123123',
            })
            .expect(400)
    })

    test('ensure that you can not update non-existing menu', async () => {
        await supertest(BASE_URL)
            .put(`/locations/${location.id}/menus/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'new name',
            })
            .expect(404)
    })

    test('ensure that you can not update menu of another nation', async () => {
        const menu = await createTestMenu(nation.oid, location.id)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.adminOtherToken)
            .send({
                name: 'new name',
            })
            .expect(401)
    })
})

test.group('Menu delete', async (group) => {
    let nation: TestNationContract
    let location: Location
    let permissions: Array<PermissionType>

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)

        permissions = await PermissionType.query().where('type', Permissions.Menus)

        await assignPermissions(nation.adminUser, permissions)
    })

    test('ensure that deleting menus requires a valid token', async () => {
        const menu = await createTestMenu(nation.oid, location.id)

        await supertest(BASE_URL)
            .delete(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)
    })

    test('ensure that deleting menus requires an admin token', async () => {
        const menu = await createTestMenu(nation.oid, location.id)

        await supertest(BASE_URL)
            .delete(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that admins can delete menus', async () => {
        const menu = await createTestMenu(nation.oid, location.id)

        await supertest(BASE_URL)
            .delete(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await supertest(BASE_URL).get(`/locations/${location.id}/menus/${menu.id}`).expect(404)
    })

    test('ensure that you can not delete a menu of another nation', async () => {
        const menu = await createTestMenu(nation.oid, location.id)

        await supertest(BASE_URL)
            .delete(`/locations/${location.id}/menus/${menu.id}`)
            .set('Authorization', 'Bearer ' + nation.adminOtherToken)
            .expect(401)

        await supertest(BASE_URL).get(`/menus/${menu.id}`).expect(200)
    })

    test('ensure that you can not delete non-existing menu', async () => {
        await supertest(BASE_URL)
            .delete(`/locations/${location.id}/menus/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })
})
