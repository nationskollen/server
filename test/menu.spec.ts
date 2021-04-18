import test from 'japa'
import supertest from 'supertest'
import Menu from 'App/Models/Menu'
import Location from 'App/Models/Location'
import { BASE_URL } from 'App/Utils/Constants'
import {
    createTestMenu,
    createTestNation,
    createTestLocation,
    TestNationContract,
} from 'App/Utils/Test'

test.group('Menu fetch', async (group) => {
    let nation: TestNationContract
    let location: Location
    let menuOne: Menu

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
        menuOne = await createTestMenu(nation.oid, location.id)
        await createTestMenu(nation.oid, location.id)
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
        const { text } = await supertest(BASE_URL)
            .get(`/locations/${location.id}/menus/${menuOne.id}`)
            .expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.name, menuOne.name)
        assert.deepEqual(data.hidden, menuOne.hidden)
    })

    test('ensure that you get an error if fetching a non-existant menu', async () => {
        await supertest(BASE_URL).get(`/locations/${location.id}/menus/99999`).expect(404)
    })
})

test.group('Menu create', async (group) => {
    const menuData = {
        name: 'Frukost',
        hidden: false,
    }

    let nation: TestNationContract
    let location: Location

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
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
        assert.deepEqual(data.oid, nation.oid)
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

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
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

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
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

        await supertest(BASE_URL).get(`/locations/${location.id}/menus/${menu.id}`).expect(200)
    })

    test('ensure that you can not delete non-existing menu', async () => {
        await supertest(BASE_URL)
            .delete(`/locations/${location.id}/menus/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })
})
