import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { Days, OpeningHourTypes } from 'App/Utils/Time'
import { TestNationContract, createTestNation } from 'App/Utils/Test'

const openingHourData = {
    type: OpeningHourTypes.Default,
    day: Days.Monday,
    open: '10:00',
    close: '20:00',
    is_open: true,
}

test.group('Opening hours create', async (group) => {
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
