import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import OpeningHour from 'App/Models/OpeningHour'
import { Days, OpeningHourTypes } from 'App/Utils/Time'
import {
    TestNationContract,
    createTestNation,
    createOpeningHour,
    createExceptionOpeningHour,
} from 'App/Utils/Test'

test.group('Opening hours create', async (group) => {
    const openingHourData = {
        type: OpeningHourTypes.Default,
        day: Days.Monday,
        open: '10:00',
        close: '20:00',
        is_open: true,
    }

    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that creating opening hours requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/opening_hours`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(openingHourData)
            .expect(401)
    })

    test('ensure that creating opening hours requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/opening_hours`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(openingHourData)
            .expect(401)
    })

    test('ensure that admins can create opening hours', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/opening_hours`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(openingHourData)
            .expect(200)

        const data = JSON.parse(text)
        assert.containsAllDeepKeys(data, Object.keys(openingHourData))
    })

    test('ensure that default opening hours require hours if open', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/opening_hours`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                type: OpeningHourTypes.Default,
                day: Days.Monday,
                is_open: true,
            })
            .expect(422)
    })

    test('ensure that exception opening hours require hours if open', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/opening_hours`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                type: OpeningHourTypes.Exception,
                day_special: 'random holiday',
                is_open: true,
            })
            .expect(422)
    })

    test('ensure that exception opening hours require name of day if open', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/opening_hours`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                type: OpeningHourTypes.Exception,
                open: '10:00',
                close: '20:00',
                is_open: true,
            })
            .expect(422)
    })

    test('ensure that exception opening hours require name of day if closed', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/opening_hours`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                type: OpeningHourTypes.Exception,
                open: '10:00',
                close: '20:00',
                is_open: false,
            })
            .expect(422)
    })
})

test.group('Opening hours update', async (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that updating opening hours requires a valid token', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send({
                day: Days.Monday,
            })
            .expect(401)
    })

    test('ensure that updating opening hours requires an admin token', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                day: Days.Monday,
            })
            .expect(401)
    })

    test('ensure that admins can update opening hours', async (assert) => {
        const openingHour = await createOpeningHour(nation.oid)
        const newData = {
            is_open: !openingHour.isOpen,
            day: openingHour.id === Days.Monday ? Days.Friday : Days.Monday,
            open: '10:00',
            close: '20:00',
        }

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newData)
            .expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.day, newData.day)
        assert.deepEqual(data.is_open, newData.is_open)
        assert.deepEqual(data.open, newData.open)
        assert.deepEqual(data.close, newData.close)
    })

    test('ensure that invalid properties are removed', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                invalidProp: 'hello',
                anotherInvalidProp: 'world',
            })
            .expect(400)
    })

    test('ensure that id and oid can not be updated', async (assert) => {
        const openingHour = await createOpeningHour(nation.oid)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                id: -1,
                // nationId is the internal column name
                nationId: nation.oid + 1,
                // oid is the serialized column name
                oid: nation.oid + 1,
                // Add a valid property to make sure that the request goes through
                is_open: false,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.id, openingHour.id)
        assert.deepEqual(data.oid, openingHour.nationId)
        assert.deepEqual(data.is_open, false)
    })

    test('ensure that updating opening hour type requires additional data', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ type: OpeningHourTypes.Exception })
            .expect(422)
    })

    test('ensure that you can update the opening hour type', async (assert) => {
        const openingHour = await createOpeningHour(nation.oid)
        const day = 'random holiday'

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                type: OpeningHourTypes.Exception,
                day_special: day,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.deepEqual(data.type, OpeningHourTypes.Exception)
        assert.deepEqual(data.day_special, day)
    })

    test('ensure that you can not update a non-existing opening hour', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/9999999999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                type: OpeningHourTypes.Exception,
                day_special: 'hello',
            })
            .expect(404)
    })

    test('ensure that you can not update an opening hour of another nation', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.adminOtherToken)
            .send({
                type: OpeningHourTypes.Exception,
                day_special: 'hello',
            })
            .expect(401)
    })

    test('ensure that closing time must be after opening time', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                open: '10:00',
                close: '09:00',
            })
            .expect(422)
    })

    test('ensure that closing time can not be equal to opening time', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                open: '10:00',
                close: '10:00',
            })
            .expect(422)
    })

    test('ensure that opening time must be in "HH:mm" format', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                open: '10:000',
            })
            .expect(422)
    })

    test('ensure that closing time must be in "HH:mm" format', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                close: '10:000',
            })
            .expect(422)
    })
})

test.group('Opening hours delete', async (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that deleting opening hours requires a valid token', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)
    })

    test('ensure that deleting opening hours requires an admin token', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that admins can delete opening hours', async (assert) => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const model = await OpeningHour.find(openingHour.id)
        assert.isNull(model)
    })

    test('ensure that you can not delete a non-existing opening hour', async () => {
        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/opening_hours/99999999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that you can not delete an opening hour of another nation', async () => {
        const openingHour = await createOpeningHour(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/opening_hours/${openingHour.id}`)
            .set('Authorization', 'Bearer ' + nation.adminOtherToken)
            .expect(401)
    })
})
