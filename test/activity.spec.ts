import test from 'japa'
import wstest from 'superwstest'
import supertest from 'supertest'
import PermissionType from 'App/Models/PermissionType'
import Location from 'App/Models/Location'
import { ActivityLevels } from 'App/Utils/Activity'
import { Permissions } from 'App/Utils/Permissions'
import { WebSocketDataTypes } from 'App/Services/Ws'
import { BASE_URL, HOSTNAME } from 'App/Utils/Constants'
import {
    TestNationContract,
    createTestNation,
    createTestLocation,
    assignPermissions,
} from 'App/Utils/Test'

test.group('Activity update', (group) => {
    let nation: TestNationContract
    let permissions: Array<PermissionType>
    let location: Location

    group.before(async () => {
        nation = await createTestNation()
        location = await createTestLocation(nation.oid)
        permissions = await PermissionType.query().where('type', Permissions.Activity)

        await assignPermissions(nation.staffUser, permissions)
    })

    test('ensure that updating activity requires a valid token', async () => {
        await supertest(BASE_URL)
            .put(`/locations/${location.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.adminOtherToken)
            .expect(401)
    })

    test('ensure that trying to update activity with no request data fails', async () => {
        await supertest(BASE_URL)
            .put(`/locations/${location.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(422)
    })

    test('ensure that invalid properties are removed when updating activity', async () => {
        await supertest(BASE_URL)
            .put(`/locations/${location.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                invalidKey: 'hello',
                anotherInvalidKey: 'world',
            })
            .expect(422)
    })

    test('ensure that staff can update activity', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                change: testLocation.maxCapacity,
            })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, testLocation.maxCapacity)
    })

    test('ensure that admins can update activity', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: testLocation.maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, testLocation.maxCapacity)
    })

    test('ensure that people count does not go below 0', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: -1 * (testLocation.maxCapacity + 10) })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that nation people count does not go above max capacity', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: testLocation.maxCapacity + 10 })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, testLocation.maxCapacity)
    })

    test('ensure that activity level changes dynamically to full', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: testLocation.maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.activity_level, ActivityLevels.Full)
    })

    test('ensure that activity level changes dynamically to medium', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                change: testLocation.maxCapacity - testLocation.maxCapacity / 2,
            })
            .expect(200)

        const data = await JSON.parse(text)

        assert.closeTo(data.activity_level, ActivityLevels.Medium, 1)
    })

    test('ensure that activity level changes dynamically to low', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: -1 * testLocation.maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.activity_level, ActivityLevels.Low)
    })

    test('ensure that closing a nation updates the activity level and resets people count', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: testLocation.maxCapacity })
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/close`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.activity_level, ActivityLevels.Closed)
        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that opening and closing a nation updates the activity level', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/close`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.activity_level, ActivityLevels.Closed)
        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that opening a nation updates the activity level', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.activity_level, ActivityLevels.Low)
        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that max capacity cannot be set to 0', async (assert) => {
        const testLocation = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${testLocation.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ max_capacity: 0 })
            .expect(422)

        const { text } = await supertest(BASE_URL)
            .get(`/locations/${testLocation.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.max_capacity, testLocation.maxCapacity)
    })

    test('ensure that a websocket event is broadcasted on open', async () => {
        const testLocation = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/close`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await wstest(HOSTNAME)
            .ws('/')
            .expectJson({ type: WebSocketDataTypes.Connected })
            .exec(async () => {
                // Trigger websocket event
                await supertest(BASE_URL)
                    .put(`/locations/${testLocation.id}/open`)
                    .set('Authorization', 'Bearer ' + nation.token)
                    .expect(200)
            })
            .expectJson({
                type: WebSocketDataTypes.Activity,
                data: {
                    oid: nation.oid,
                    location_id: testLocation.id,
                    activity_level: ActivityLevels.Low,
                },
            })
            .close()
            .expectClosed()
    })

    test('ensure that a websocket event is broadcasted on close', async () => {
        const testLocation = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await wstest(HOSTNAME)
            .ws('/')
            .expectJson({ type: WebSocketDataTypes.Connected })
            .exec(async () => {
                // Trigger websocket event
                await supertest(BASE_URL)
                    .put(`/locations/${testLocation.id}/close`)
                    .set('Authorization', 'Bearer ' + nation.token)
                    .expect(200)
            })
            .expectJson({
                type: WebSocketDataTypes.Activity,
                data: {
                    oid: nation.oid,
                    location_id: testLocation.id,
                    activity_level: ActivityLevels.Closed,
                },
            })
            .close()
            .expectClosed()
    })

    test('ensure that a websocket event is broadcasted on activty level change', async () => {
        const testLocation = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/close`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await supertest(BASE_URL)
            .put(`/locations/${testLocation.id}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        // After opening again, the estimated people count is 0 and
        // activty level is not ActivityLevels.Low
        await wstest(HOSTNAME)
            .ws('/')
            .expectJson({ type: WebSocketDataTypes.Connected })
            .exec(async () => {
                // Set the current capacity to the max capacity,
                // giving us a current activity of ActivityLevels.Full
                await supertest(BASE_URL)
                    .put(`/locations/${testLocation.id}/activity`)
                    .set('Authorization', 'Bearer ' + nation.token)
                    .send({ change: testLocation.maxCapacity })
                    .expect(200)
            })
            .expectJson({
                type: WebSocketDataTypes.Activity,
                data: {
                    oid: nation.oid,
                    location_id: testLocation.id,
                    activity_level: ActivityLevels.Full,
                },
            })
            .close()
            .expectClosed()
    })

    test('ensure that it is possible to set the estimated amount of people exactly', async (assert) => {
        const location = await createTestLocation(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/locations/${location.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                max_capacity: 500,
                estimated_people_count: 250
            })
            .expect(200)

        const text2 = await supertest(BASE_URL)
            .put(`/locations/${location.id}/activity`)
            .set('authorization', 'bearer ' + nation.token)
            .send({
                exact_amount: 20
            })
            .expect(200)

        const data2 = JSON.parse(text2.text)
        // Defaults to false upon event creation
        assert.equal(data2.estimated_people_count, 20)
    })

    test('ensure that it is possible to set the change AND estimated amount of people exactly at the same request, but the latter is prioritized ', async (assert) => {
        const location = await createTestLocation(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/locations/${location.id}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                exact_amount: 20,
                change: 150
            })
            .expect(200)
        
        const data = JSON.parse(text)

        assert.equal(data.estimated_people_count, 20)
    })
})
