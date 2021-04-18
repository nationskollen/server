import test from 'japa'
import path from 'path'
import { DateTime } from 'luxon'
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
        occurs_at: DateTime.fromObject({
            year: 2021,
            month: 3,
            day: 16,
            hour: 15,
            minute: 20,
        }).toISO(),
        ends_at: DateTime.fromObject({
            year: 2021,
            month: 3,
            day: 16,
            hour: 20,
            minute: 0,
        }).toISO(),
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
                ...eventData,
                location_id: location2.id,
            })
            .expect(422)

        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                ...eventData,
                location_id: location.id,
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.location_id, location.id)
    })

    test('ensure that an datetimes are converted into UTC+2', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/events`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'utc test',
                description: 'timezones',
                // Specify times in Zulu-time (UTC).
                // These should be converted into UTC+2 (Swedish time).
                occurs_at: '2021-02-10T20:00:00.000Z',
                ends_at: '2021-02-10T22:00:00.000Z',
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.equal(data.occurs_at, '2021-02-10T22:00:00.000+02:00')
        assert.equal(data.ends_at, '2021-02-11T00:00:00.000+02:00')
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
                name: 'new name',
            })
            .expect(401)
    })

    test('ensure that updating an event requires an admin token', async () => {
        const event = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                name: 'new name',
            })
            .expect(401)
    })

    test('ensure that admins can update an event', async (assert) => {
        const event = await createTestEvent(nation.oid)
        const newName = 'hello world'

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: newName,
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.name, newName)
    })

    test('ensure that admins can add a location to an existing event', async (assert) => {
        const event = await createTestEvent(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                location_id: location.id,
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.location_id, location.id)
    })

    test('ensure that admins can update an events different fields', async (assert) => {
        const event = await createTestEvent(nation.oid)
        const newName = 'new event'
        const occursAt = DateTime.fromObject({
            year: 2021,
            month: 3,
            day: 16,
            hour: 15,
            minute: 20,
        })
            .setZone('utc+2')
            .toISO()
        const endsAt = DateTime.fromObject({
            year: 2021,
            month: 3,
            day: 16,
            hour: 20,
            minute: 0,
        })
            .setZone('utc+2')
            .toISO()

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: newName,
                occurs_at: occursAt,
                ends_at: endsAt,
                location_id: location.id,
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.name, newName)
        assert.equal(data.location_id, location.id)
        assert.equal(data.occurs_at, occursAt)
        assert.equal(data.ends_at, endsAt)
    })

    test('ensure that updating the location requires a valid location id', async () => {
        const event = await createTestEvent(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                location_id: 99999,
            })
            .expect(422)
    })

    test('ensure that the name of an event must be a string', async () => {
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
            .put(`/nations/${nation.oid}/events/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'TheNew',
            })
            .expect(404)
    })

    test('ensure that an datetimes are converted into UTC+2', async (assert) => {
        const event = await createTestEvent(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/events/${event.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                // Specify times in Zulu-time (UTC).
                // These should be converted into UTC+2 (Swedish time).
                occurs_at: '2021-02-10T20:00:00.000Z',
                ends_at: '2021-02-10T22:00:00.000Z',
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.equal(data.occurs_at, '2021-02-10T22:00:00.000+02:00')
        assert.equal(data.ends_at, '2021-02-11T00:00:00.000+02:00')
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
            .delete(`/nations/${nation.oid}/events/99999`)
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
            .post(`/events/99999/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(404)
    })
})
