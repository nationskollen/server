import test from 'japa'
import path from 'path'
import supertest from 'supertest'
import Menu from 'App/Models/Menu'
import MenuItem from 'App/Models/MenuItem'
import Location from 'App/Models/Location'
import { BASE_URL, HOSTNAME } from 'App/Utils/Constants'
import {
    createTestMenu,
    createTestNation,
    createTestLocation,
    createTestMenuItem,
    TestNationContract,
    toRelativePath,
} from 'App/Utils/Test'

test.group('Menu item fetch', async (group) => {
    let nation: TestNationContract
    let location: Location
    let menu: Menu
    let menuItemOne: MenuItem

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
        menu = await createTestMenu(nation.oid, location.id)
        menuItemOne = await createTestMenuItem(menu.id)

        // Create another one just for verifying the count when fetching all
        await createTestMenuItem(menu.id)
        // Create another for pagination testing
        await createTestMenuItem(menu.id)
    })

    test('ensure that you can fetch all items of a menu', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/menus/${menu.id}/items`).expect(200)

        const data = JSON.parse(text)

        assert.isNotEmpty(data)
        assert.lengthOf(data.data, 3)
    })

    test('ensure that you can fetch paginated items of a menu', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .get(`/menus/${menu.id}/items?page=1&amount=1`)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotEmpty(data)
        assert.lengthOf(data.data, 1)
    })

    test('ensure that you cannot paginate for zero pages', async () => {
        await supertest(BASE_URL).get(`/menus/${menu.id}/items?page=0&amount=1`).expect(422)
    })

    test('ensure that you can paginate for two items when three are present in a menu', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .get(`/menus/${menu.id}/items?page=1&amount=2`)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotEmpty(data)
        assert.lengthOf(data.data, 2)

        const text2 = await supertest(BASE_URL)
            .get(`/menus/${menu.id}/items?page=2&amount=1`)
            .expect(200)

        // Make sure that if we paginate for the second page we get the last menu item
        const data2 = JSON.parse(text2.text)
        assert.isNotEmpty(data2)
        assert.lengthOf(data2.data, 1)
    })

    test('ensure that it returns an empty array if the location has no menus', async (assert) => {
        const testMenu = await createTestMenu(nation.oid, location.id)

        const { text } = await supertest(BASE_URL).get(`/menus/${testMenu.id}/items`).expect(200)

        const data = JSON.parse(text)

        assert.isEmpty(data.data)
        assert.lengthOf(data.data, 0)
    })

    test('ensure that you can fetch a single menu item', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/items/${menuItemOne.id}`).expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.name, menuItemOne.name)
        assert.deepEqual(data.hidden, menuItemOne.hidden)
    })

    test('ensure that you get an error if fetching a non-existant menu item', async () => {
        await supertest(BASE_URL).get(`/items/99999`).expect(404)
    })
})

test.group('Menu item create', async (group) => {
    const menuItemData = {
        name: 'Gofika',
        description: 'Gott fika',
        price: 100.2,
        hidden: false,
    }

    let nation: TestNationContract
    let location: Location
    let menu: Menu

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
        menu = await createTestMenu(nation.oid, location.id)
    })

    test('ensure that creating menus requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(menuItemData)
            .expect(401)
    })

    test('ensure that creating menus requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(menuItemData)
            .expect(401)
    })

    test('ensure that admins can create menus', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(menuItemData)
            .expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.name, menuItemData.name)
        assert.deepEqual(data.description, menuItemData.description)
        assert.deepEqual(data.price, menuItemData.price)
        assert.deepEqual(data.hidden, menuItemData.hidden)
        assert.deepEqual(data.menu_id, menu.id)
    })

    test('ensure that invalid properties are removed', async () => {
        await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                nationId: 1000,
                locationId: 99,
                randomKey: '1000',
            })
            .expect(422)
    })

    test('ensure that you can not create a menu item on a menu of another nation', async () => {
        await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items`)
            .set('Authorization', 'Bearer ' + nation.adminOtherToken)
            .send(menuItemData)
            .expect(401)
    })
})

test.group('Menu item update', async (group) => {
    const menuItemData = {
        name: 'New name',
        description: 'new description',
        price: 200.0,
    }

    let nation: TestNationContract
    let location: Location
    let menu: Menu

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
        menu = await createTestMenu(nation.oid, location.id)
    })

    test('ensure that updating menu items requires a valid token', async () => {
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .put(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(menuItemData)
            .expect(401)
    })

    test('ensure that updating menu items requires an admin token', async () => {
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .put(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(menuItemData)
            .expect(401)
    })

    test('ensure that admins can update menu items', async (assert) => {
        const menuItem = await createTestMenuItem(menu.id)

        const { text } = await supertest(BASE_URL)
            .put(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                ...menuItemData,
                hidden: !menuItem.hidden,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.name, menuItemData.name)
        assert.deepEqual(data.description, menuItemData.description)
        assert.deepEqual(data.price, menuItemData.price)
        assert.deepEqual(data.hidden, !menuItem.hidden)
    })

    test('ensure that invalid properties are removed', async () => {
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .put(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                nationId: 123,
                locationId: 20000,
                test: '123123',
            })
            .expect(400)
    })

    test('ensure that invalid properties are removed', async () => {
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .put(`/menus/${menu.id}/items/${menuItem.id}`)
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
            .put(`/menus/${menu.id}/items/9999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'new name',
            })
            .expect(404)
    })

    test('ensure that you can not update menu of another nation', async () => {
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .put(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + nation.adminOtherToken)
            .send({
                name: 'new name',
            })
            .expect(401)
    })
})

test.group('Menu item delete', async (group) => {
    let nation: TestNationContract
    let location: Location
    let menu: Menu

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
        menu = await createTestMenu(nation.oid, location.id)
    })

    test('ensure that deleting menu items requires a valid token', async () => {
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .delete(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)
    })

    test('ensure that deleting menu items requires an admin token', async () => {
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .delete(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that admins can delete menu items', async () => {
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .delete(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await supertest(BASE_URL).get(`/menus/${menu.id}/items/${menuItem.id}`).expect(404)
    })

    test('ensure that you can not delete a menu item of another nation', async () => {
        const menuItem = await createTestMenuItem(menu.id)

        await supertest(BASE_URL)
            .delete(`/menus/${menu.id}/items/${menuItem.id}`)
            .set('Authorization', 'Bearer ' + nation.adminOtherToken)
            .expect(401)

        await supertest(BASE_URL).get(`/items/${menuItem.id}`).expect(200)
    })

    test('ensure that you can not delete non-existing menu item', async () => {
        await supertest(BASE_URL)
            .delete(`/menus/${menu.id}/items/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })
})

test.group('Menu item upload', (group) => {
    const coverImagePath = path.join(__dirname, 'data/cover.png')
    let nation: TestNationContract
    let location: Location
    let menu: Menu
    let menuItem: MenuItem

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
        menu = await createTestMenu(nation.oid, location.id)
        menuItem = await createTestMenuItem(menu.id)
    })
    test('ensure that uploading images requires a valid token', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items/${menuItem.id}/upload`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .attach('cover', coverImagePath)
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that uploading an image to a menu item with a non-admin token fails', async () => {
        await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items/${menuItem.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that admins can upload cover image', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items/${menuItem.id}/upload`)
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
            .post(`/menus/${menu.id}/items/${menuItem.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.cover_img_src)

        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(200)

        // Upload new images
        await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items/${menuItem.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        // Ensure that the previously uploaded images have been removed
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(404)
    })

    test('ensure that uploading an image requires an attachment', async () => {
        await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items/${menuItem.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ randomData: 'hello' })
            .expect(422)
    })

    test('ensure that uploading images to a non-existant menu item fails', async () => {
        await supertest(BASE_URL)
            .post(`/menus/${menu.id}/items/99999/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(404)
    })
})
