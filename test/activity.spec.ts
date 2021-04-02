import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { ActivityLevels } from 'App/Utils/Activity'
import { TestNationContract, createTestNation } from 'App/Utils/Test'

test.group('Activity update', (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that updating a nation activity requires authorization', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.adminOtherToken)
            .expect(401)
    })

    test('ensure that trying to update nation activity with no request data fails', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(422)
    })

    test('ensure that invalid properties are removed when updating nation activity', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({
                invalidKey: 'hello',
                anotherInvalidKey: 'world',
            })
            .expect(422)
    })

    test('ensure that updating a nation activity works with staff permissions', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send({ change: nation.maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, nation.maxCapacity)
    })

    test('ensure that updating a nation activity works with admin permissions', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: nation.maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, nation.maxCapacity)
    })

    test('ensure that nation people count does not go below 0', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: -1 * (nation.maxCapacity + 10) })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that nation people count does not go above max capacity', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: nation.maxCapacity + 10 })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.estimated_people_count, nation.maxCapacity)
    })

    test('ensure that activity level changes dynamically to full', async (assert) => {
        // Since .isOpen default to false, we need to make sure it is open in
        // order to test it closing.
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: nation.maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)

        assert.equal(data.activity_level, ActivityLevels.Full)
    })

    test('ensure that activity level changes dynamically to medium +- 1 (range: low - high)', async (assert) => {
        // Since .isOpen default to false, we need to make sure it is open in
        // order to test it closing.
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                change: nation.maxCapacity - nation.maxCapacity / 2 - nation.estimatedPeopleCount,
            })
            .expect(200)

        const data = await JSON.parse(text)

        assert.closeTo(data.activity_level, ActivityLevels.Medium, 1)
    })

    test('ensure that activity level changes dynamically to low (when rounding from 0)', async (assert) => {
        // Since .isOpen default to false, we need to make sure it is open in
        // order to test it closing.
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/activity`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ change: -1 * nation.maxCapacity })
            .expect(200)

        const data = await JSON.parse(text)
        // TODO Should become low during opening hours, but is "closed"
        assert.equal(data.activity_level, ActivityLevels.Low)
    })

    test('ensure that nation is closed on PUT', async (assert) => {
        // Since .isOpen default to false, we need to make sure it is open in
        // order to test it closing.
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/close`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = await JSON.parse(text)
        assert.equal(data.activity_level, ActivityLevels.Closed)
        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that nation is open on PUT', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/open`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = await JSON.parse(text)
        assert.equal(data.activity_level, ActivityLevels.Low)
        assert.equal(data.estimated_people_count, 0)
    })

    test('ensure that max capacity cannot be set to 0', async (assert) => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ max_capacity: 0 })
            .expect(422)

        const { text } = await supertest(BASE_URL)
            .get(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = await JSON.parse(text)
        assert.equal(data.max_capacity, nation.maxCapacity)
    })
})
