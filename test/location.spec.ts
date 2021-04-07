import test from 'japa'
import supertest from 'supertest'
import Location from 'App/Models/Location'
import { BASE_URL } from 'App/Utils/Constants'
import OpeningHour from 'App/Models/OpeningHour'
import { Days, OpeningHourTypes } from 'App/Utils/Time'
import {
    TestNationContract,
    createTestNation,
    createTestLocation,
} from 'App/Utils/Test'


test.group('Locations create', async (group) => {

    let nation: TestNationContract
    let locationData = {
        name: "testPlats",
        description: "Lunchplats",
        address: "Dragarbrunnsgatan 27B",
        max_capacity: 250,
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
})

