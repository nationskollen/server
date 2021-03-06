import test from 'japa'
import path from 'path'
import supertest from 'supertest'
import Location from 'App/Models/Location'
import { BASE_URL, HOSTNAME } from 'App/Utils/Constants'
import {
    TestNationContract,
    createTestNation,
    createTestLocation,
    toRelativePath,
} from 'App/Utils/Test'
import { ActivityLevels } from 'App/Utils/Activity'

test.group('Locations fetch', async () => {
    test('ensure a location is default false as the default location', async (assert) => {
        const nation = await createTestNation()
        const location = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL).get(`/locations/${location.id}`).expect(200)

        const data = JSON.parse(text)

        assert.isFalse(data.is_default)
    })
})

test.group('Locations create', async (group) => {
    let nation: TestNationContract
    let locationData = {
        name: 'testPlats',
        description: 'Lunchplats',
        address: 'Dragarbrunnsgatan 27B',
        max_capacity: 250,
        show_on_map: false,
    }

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that creating a location requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(locationData)
            .expect(401)
    })

    test('ensure that creating a location requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(locationData)
            .expect(401)
    })

    test('ensure that admins can create a location', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(locationData)
            .expect(200)

        const data = JSON.parse(text)
        assert.containsAllDeepKeys(data, Object.keys(locationData))
    })

    test('ensure that latitude only accepts valid coordinates', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                ...locationData,
                show_on_map: true,
                latitude: -91.0,
                longitude: 0.0,
            })
            .expect(422)
    })

    test('ensure that longitude only accepts valid coordinates', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                ...locationData,
                show_on_map: true,
                latitude: 0.0,
                longitude: -181.0,
            })
            .expect(422)
    })

    test('ensure that coordinates are required if show on map is true', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                ...locationData,
                show_on_map: true,
            })
            .expect(422)
    })

    test('ensure that you can set coordinates', async (assert) => {
        const latitude = 59.856227
        const longitude = 17.6378425

        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/locations`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                ...locationData,
                show_on_map: true,
                latitude,
                longitude,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.equal(data.latitude, latitude)
        assert.equal(data.longitude, longitude)
        assert.equal(data.show_on_map, true)
    })
})

test.group('Locations update', async (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that updating a location requires a valid token', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send({
                name: 'TheNew',
            })
            .expect(401)
    })

    test('ensure that updating a location requires an admin token', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                name: 'TheNew',
            })
            .expect(401)
    })

    test('ensure that admins can update a location', async (assert) => {
        const location = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'TheNew',
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.name, 'TheNew')
    })

    test('ensure that admins can update a location max_capacity', async (assert) => {
        const location = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                max_capacity: 500,
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.max_capacity, 500)
    })

    test('ensure that admins cannot update a location max_capacity falsely', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                max_capacity: '500a',
            })
            .expect(422)
    })

    test('ensure that when disabling activity level, it is not possible to change activity level', async (assert) => {
        const location = await createTestLocation(nation.oid)

        const text1 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                max_capacity: 500,
            })
            .expect(200)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/activity`)
            .set('authorization', 'bearer ' + nation.token)
            .send({
                change: 20,
            })
            .expect(200)

        const data1 = JSON.parse(text1.text)
        // Defaults to false upon event creation
        assert.isFalse(data1.activity_level_disabled)
        assert.notEqual(data1.activity_level, ActivityLevels.Disabled)

        const text2 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('authorization', 'bearer ' + nation.token)
            .send({
                activity_level_disabled: true,
            })
            .expect(200)

        const data2 = JSON.parse(text2.text)
        // Defaults to false upon event creation
        assert.isTrue(data2.activity_level_disabled)
        assert.equal(data2.estimated_people_count, 0)
        assert.equal(data2.activity_level, ActivityLevels.Disabled)

        await supertest(BASE_URL)
            .put(`/locations/${location.id}/activity`)
            .set('authorization', 'bearer ' + nation.token)
            .send({
                change: 20,
            })
            .expect(422)
    })

    test('ensure that admins cannot update a location name falsely', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 500,
            })
            .expect(422)
    })

    test('ensure that it is not possible to update a non-existing location', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'TheNew',
            })
            .expect(404)
    })

    test('ensure that admins can update multiple locations in a nation', async (assert) => {
        const location1 = await createTestLocation(nation.oid)
        const location2 = await createTestLocation(nation.oid)

        const text1 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location1.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                max_capacity: 10,
            })
            .expect(200)

        const data1 = JSON.parse(text1.text)
        assert.equal(data1.max_capacity, 10)

        const text2 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location2.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'TheNewName',
            })
            .expect(200)

        const data2 = JSON.parse(text2.text)
        assert.equal(data2.name, 'TheNewName')
    })

    test('ensure that latitude only accepts valid coordinates', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                show_on_map: true,
                latitude: -91.0,
                longitude: 0,
            })
            .expect(422)
    })

    test('ensure that longitude only accepts valid coordinates', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                show_on_map: true,
                latitude: 0,
                longitude: -181.0,
            })
            .expect(422)
    })

    test('ensure that coordinates are required if show on map is true', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                show_on_map: true,
            })
            .expect(422)
    })

    test('ensure that you can update coordinates', async (assert) => {
        const latitude = 59.856227
        const longitude = 17.6378425

        const location = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                show_on_map: true,
                latitude,
                longitude,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.equal(data.latitude, latitude)
        assert.equal(data.longitude, longitude)
        assert.equal(data.show_on_map, true)
    })

    test('ensure setting a default nation location updates the fetch with the default location in it', async (assert) => {
        const location = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                is_default: true,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.isTrue(data.is_default)

        const text2 = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data2 = JSON.parse(text2.text)

        assert.equal(data2.default_location.id, location.id)
    })

    test('ensure setting a new nation default location sets the previous default to false', async (assert) => {
        const location = await createTestLocation(nation.oid)
        const location2 = await createTestLocation(nation.oid)

        // Set first location to default
        let text1 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                is_default: true,
            })
            .expect(200)

        // assure it is default
        let data1 = JSON.parse(text1.text)
        assert.isTrue(data1.is_default)

        // Set second location to default
        const text2 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location2.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                is_default: true,
            })
            .expect(200)

        text1 = await supertest(BASE_URL).get(`/locations/${location.id}`).expect(200)

        data1 = JSON.parse(text1.text)

        // Assure new location becomes default while also checking the
        // previously has become false
        const data2 = JSON.parse(text2.text)
        assert.isTrue(data2.is_default)
        assert.isFalse(data1.is_default)

        const text3 = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        // Make sure that the new said default is the default in nation
        const data3 = JSON.parse(text3.text)
        assert.equal(data3.default_location.id, location2.id)
    })

    test("ensure setting default locations does not affect other nation's default location", async (assert) => {
        let nation2: TestNationContract
        nation2 = await createTestNation()
        const location = await createTestLocation(nation.oid)
        const location2 = await createTestLocation(nation2.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                is_default: true,
            })
            .expect(200)

        await supertest(BASE_URL)
            .put(`/nations/${nation2.oid}/locations/${location2.id}`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .send({
                is_default: true,
            })
            .expect(200)

        const text2 = await supertest(BASE_URL).get(`/nations/${nation2.oid}/`).expect(200)

        const text1 = await supertest(BASE_URL).get(`/nations/${nation.oid}/`).expect(200)

        const data1 = JSON.parse(text1.text)
        const data2 = JSON.parse(text2.text)
        // Make sure that even when changing default location of other nation
        // it does not affect another nations default location
        assert.equal(data1.default_location.id, location.id)
        assert.equal(data2.default_location.id, location2.id)
    })
})

test.group('Location delete', async (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that deletion of a location requires a valid token', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)
    })

    test('ensure that deletion of a location requires an admin token', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that deletion of a location is viable', async () => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        // making sure location loaction was removed from location nation
        await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that deletion of a non-existing location is not viable', async () => {
        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that admins can delete multiple locations in a nation', async () => {
        const location1 = await createTestLocation(nation.oid)
        const location2 = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/${location1.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        // making sure location loaction was removed from location nation
        await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/locations/${location1.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/locations/${location2.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        // making sure location loaction was removed from location nation
        await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/locations/${location2.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })
})

test.group('Location upload', (group) => {
    let nation: TestNationContract
    let location: Location

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
    })

    test('ensure that uploading an image requires an attachment', async () => {
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ randomData: 'hello' })
            .expect(422)
    })
})

test.group('Location upload', (group) => {
    const coverImagePath = path.join(__dirname, 'data/cover.png')
    let nation: TestNationContract
    let location: Location

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
    })

    test('ensure that uploading images requires a valid token', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/locations/${location.id}/upload`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .attach('cover', coverImagePath)
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that updating a nation with a non-admin token fails', async () => {
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that admins can upload cover image and icon', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/locations/${location.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.cover_img_src)

        // Ensure that location uploaded images can be accessed via location specified URL
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(200)
    })

    test('ensure that old uploads are removed', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/locations/${location.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.cover_img_src)

        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(200)

        // Upload new images
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        // Ensure that location previously uploaded images have been removed
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(404)
    })

    test('ensure that uploading an image requires an attachment', async () => {
        await supertest(BASE_URL)
            .post(`/locations/${location.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ randomData: 'hello' })
            .expect(422)
    })

    test('ensure that uploading images to a non-existant location fails', async () => {
        await supertest(BASE_URL)
            .post(`/locations/99999/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(404)
    })
})
