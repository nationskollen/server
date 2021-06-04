import test from 'japa'
// import News from 'App/Models/News'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { TestNationContract, createTestNation } from 'App/Utils/Test'

test.group('News fetch', () => {
    const newsData = {
        title: 'NEWSS!!!',
        short_description: 'NotEvent',
        long_description: 'Lorem ipsum',
    }

    test('ensure creating news, we can fetch the notification', async (assert) => {
        const nation = await createTestNation()

        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/news`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newsData)
            .expect(200)

        const data = JSON.parse(text)

        const text1 = await supertest(BASE_URL).get(`/news/${data.id}`).expect(200)

        const data1 = JSON.parse(text1.text)
        assert.isNotNull(data1)
        assert.equal(newsData.short_description, data1.short_description)
        assert.equal(newsData.title, data1.title)
    })

    test('ensure we can fetch all news', async (assert) => {
        const nation2 = await createTestNation()
        const nation3 = await createTestNation()

        for (let i = 0; i < 3; i++) {
            await supertest(BASE_URL)
                .post(`/nations/${nation3.oid}/news`)
                .set('Authorization', 'Bearer ' + nation3.token)
                .send(newsData)
                .expect(200)
        }

        for (let i = 0; i < 3; i++) {
            await supertest(BASE_URL)
                .post(`/nations/${nation2.oid}/news`)
                .set('Authorization', 'Bearer ' + nation2.token)
                .send(newsData)
                .expect(200)
        }

        const { text } = await supertest(BASE_URL).get(`/news`).expect(200)

        const data = JSON.parse(text)
        assert.notEqual(data.data.length, 0)
        assert.equal(data.meta.total, 7)
        assert.equal(data.data.length, 7)
    })

    test('ensure we can fetch all news and paginate', async (assert) => {
        const nation2 = await createTestNation()
        const nation3 = await createTestNation()

        for (let i = 0; i < 3; i++) {
            await supertest(BASE_URL)
                .post(`/nations/${nation3.oid}/news`)
                .set('Authorization', 'Bearer ' + nation3.token)
                .send(newsData)
                .expect(200)
        }

        for (let i = 0; i < 3; i++) {
            await supertest(BASE_URL)
                .post(`/nations/${nation2.oid}/news`)
                .set('Authorization', 'Bearer ' + nation2.token)
                .send(newsData)
                .expect(200)
        }

        const { text } = await supertest(BASE_URL).get(`/news?page=1&amount=2`).expect(200)

        const data = JSON.parse(text)
        assert.notEqual(data.data.length, 0)
        assert.equal(data.meta.total, 13)
        assert.equal(data.meta.per_page, 2)
        assert.equal(data.meta.current_page, 1)
        assert.equal(data.data.length, 2)
    })

    test('ensure that news are ordered by descending order', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/news`).expect(200)

        const data = JSON.parse(text).data

        for (const index in data) {
            if (data[index + 1]) {
                assert.isTrue(data[index].created_at.toISO > data[index + 1].created_at.toISO)
            }
        }
    })
})

test.group('Events create', async (group) => {
    let nation: TestNationContract
    const newsData = {
        title: 'NEWSS!!!',
        short_description: 'NotEvent',
        long_description: 'Lorem ipsum',
    }

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that creating news requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/news`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(newsData)
            .expect(401)
    })

    test('ensure that creating news requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/news`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(newsData)
            .expect(401)
    })

    test('ensure that admins can create news', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/news`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newsData)
            .expect(200)

        const data = JSON.parse(text)
        const compareData: Record<string, unknown> = { ...newsData }
        delete compareData.long_description
        assert.containsAllKeys(data, compareData)
    })

    test('ensure that an admin cannot create news for the incorrect nation', async () => {
        const nation2 = await createTestNation()

        await supertest(BASE_URL)
            .post(`/nations/${nation2.oid}/news`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newsData)
            .expect(401)

        await supertest(BASE_URL)
            .post(`/nations/${nation2.oid}/news`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .send(newsData)
            .expect(200)
    })
})
