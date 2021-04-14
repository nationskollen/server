import test from 'japa'
import path from 'path'
import supertest from 'supertest'
import Location from 'App/Models/Location'
import Event from 'App/Models/Event'
import { BASE_URL, HOSTNAME } from 'App/Utils/Constants'
import {
    TestNationContract,
    createTestNation,
    createTestLocation,
    createTestEvent,
    toRelativePath,
} from 'App/Utils/Test'

test.group('Events create', async (group) => {
    let nation: TestNationContract
    let eventData = {
        name: 'testEvent',
        description: 'Lunchevent',
        occurs_at: '12:30',
        ends_at: '21:30',
    }

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that creating an event requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(eventData)
            .expect(401)
    })

    test('ensure that creating an event requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(eventData)
            .expect(401)
    })

    test('ensure that admins can create an event', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(eventData)
            .expect(200)

        const data = JSON.parse(text)
        assert.containsAllDeepKeys(data, Object.keys(eventData))
    })

    test('ensure that an admin cannot create an event for the incorrect nation', async (assert) => {
        const location = await createTestLocation(nation.oid)

        const nation2 = await createTestNation()
        const location2 = await createTestLocation(nation2.oid)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'name',
                description: 'description',
                location_id: location2.id,
                occurs_at: '20:30',
                ends_at: '21:30',
            })
            .expect(422)

        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'name',
                description: 'description',
                location_id: location.id,
                occurs_at: '20:30',
                ends_at: '21:30',
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.location_id, location.id)
    })
})

test.group('Events update', async (group) => {
    let nation: TestNationContract
    let location: Location

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
    })

    test('ensure that updating an event requires a valid token', async () => {
        const event = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send({
                name: event.name,
                description: event.description,
                occurs_at: event.occursAt,
                location_id: location.id,
                ends_at: event.endsAt,
            })
            .expect(401)
    })

    test('ensure that updating an event requires an admin token', async () => {
        const event = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                name: event.name,
                description: event.description,
                occurs_at: event.occursAt,
                location_id: location.id,
                ends_at: event.endsAt,
            })
            .expect(401)
    })

    test('ensure that admins can update an event, making the event part of a location', async (assert) => {
        const event = await createTestEvent(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: event.name,
                location_id: location.id,
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.location_id, location.id)
    })

    test('ensure that admins can update an events different fields', async (assert) => {
        const event = await createTestEvent(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'NewEvent',
                location_id: location.id,
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.name, 'NewEvent')
        assert.equal(data.location_id, location.id)
    })

    test('ensure that admins cannot update an events location id falsely', async () => {
        const event = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'NewEvent',
                location_id: 999999999999,
            })
            .expect(422)
    })

    test('ensure that admins cannot update an event name falsely', async () => {
        const event = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 500,
            })
            .expect(422)
    })

    test('ensure that it is not possible to update a non-existing event', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/999999999999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'TheNew',
            })
            .expect(404)
    })

    test('ensure that admins can update multiple locations in a nation', async (assert) => {
        const event1 = await createTestEvent(nation.oid)
        const event2 = await createTestEvent(nation.oid)

        const text1 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event1.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'Event1',
            })
            .expect(200)

        const data1 = JSON.parse(text1.text)
        assert.equal(data1.name, 'Event1')

        const text2 = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event2.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                location_id: location.id,
            })
            .expect(200)

        const data2 = JSON.parse(text2.text)
        assert.equal(data2.location_id, location.id)
    })
})

test.group('Event delete', async (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that deletion of an event requires a valid token', async () => {
        const event = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)
    })

    test('ensure that deletion of an event requires an admin token', async () => {
        const event = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that deletion of an event is viable', async () => {
        const event = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        // making sure the event was removed from the nation
        await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that deletion of a non-existing event is not viable', async () => {
        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/events/999999999999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that admins can delete multiple events in a nation', async () => {
        const event1 = await createTestEvent(nation.oid)
        const event2 = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/events/${event1.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        // making sure the event was removed from the nation
        await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/events/${event1.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/events/${event2.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        // making sure the event was removed from the nation
        await supertest(BASE_URL)
            .get(`/nations/${nation.oid}/events/${event2.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })
})

test.group('Event upload', (group) => {
    let nation: TestNationContract
    let event: Event

    group.before(async () => {
        nation = await createTestNation()
        event = await createTestEvent(nation.oid)
    })

    test('ensure that uploading an image requires an attachment', async () => {
        await supertest(BASE_URL)
            .post(`/events/${event.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ randomData: 'hello' })
            .expect(422)
    })
})

test.group('Event upload', (group) => {
    const coverImagePath = path.join(__dirname, 'data/cover.png')
    let nation: TestNationContract
    let event: Event

    group.before(async () => {
        nation = await createTestNation()
        event = await createTestEvent(nation.oid)
    })

    test('ensure that uploading images requires a valid token', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/events/${event.id}/upload`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .attach('cover', coverImagePath)
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that updating an event with a non-admin token fails', async () => {
        await supertest(BASE_URL)
            .post(`/events/${event.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that admins can upload cover image and icon', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/events/${event.id}/upload`)
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
            .post(`/events/${event.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.cover_img_src)

        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(200)

        // Upload new images
        await supertest(BASE_URL)
            .post(`/events/${event.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        // Ensure that the previously uploaded images have been removed
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(404)
    })

    test('ensure that uploading an image requires an attachment', async () => {
        await supertest(BASE_URL)
            .post(`/events/${event.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ randomData: 'hello' })
            .expect(422)
    })

    test('ensure that uploading images to a non-existant event fails', async () => {
        await supertest(BASE_URL)
            .post(`/events/999999999999/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(404)
    })
})
