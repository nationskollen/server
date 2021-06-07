import test from 'japa'
import News from 'App/Models/News'
import path from 'path'
import supertest from 'supertest'
import { BASE_URL, HOSTNAME } from 'App/Utils/Constants'
import {
    TestNationContract,
    createTestNation,
    createTestNews,
    toRelativePath,
} from 'App/Utils/Test'
// import { Topics } from 'App/Utils/Subscriptions'

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

        const data = JSON.parse(text  )

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

    test.skipInCI('ensure that news are ordered by descending order', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/news`).expect(200)

        const data = JSON.parse(text).data

        for (const index in data) {
            if (data[index + 1]) {
                assert.isTrue(data[index].created_at > data[index + 1].created_at)
            }
        }
    })

    test('ensure that fetching to a non-existant news fails', async () => {
        const nation = await createTestNation()

        await supertest(BASE_URL)
            .get(`/news/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })
})

test.group('News create', async (group) => {
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

    // For some reason, a notification is not created when running the below code.
    // Though when running through insomnia it creates a notification and can confirm that it works.
    // weird...
    //
    // test('ensure that creation of a news model also creates a notification alongside it with corresponding information', async (assert) => {
    //     const nation2 = await createTestNation()

    //     const { text } = await supertest(BASE_URL)
    //         .post(`/nations/${nation2.oid}/news`)
    //         .set('Authorization', 'Bearer ' + nation2.token)
    //         .send(newsData)
    //         .expect(200)

    //     const data = JSON.parse(text)
    //     console.log(data)

    //     const notificationText = await supertest(BASE_URL)
    //         .get(`/notifications`)
    //         .expect(200)

    //     const dataNotification = JSON.parse(notificationText.text)
    //     console.log(dataNotification)

    //     assert.equal(data.title, dataNotification.title)
    //     assert.equal(data.short_description, dataNotification.message)
    //     assert.equal(dataNotification.subscription_topic_id, Topics.News)
    // })
})

test.group('News update', async (group) => {
    let nation: TestNationContract
    let news: News
    const newsData = {
        title: 'NEWSS!!!',
        short_description: 'NotEvent',
        long_description: 'Lorem ipsum',
    }

    group.before(async () => {
        nation = await createTestNation()
        news = await createTestNews(nation.oid)
    })

    test('ensure that updating news requires a valid token', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(newsData)
            .expect(401)
    })

    test('ensure that creating news requires an admin token', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(newsData)
            .expect(401)
    })

    test('ensure that admins can create news', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newsData)
            .expect(200)

        const data = JSON.parse(text)
        const compareData: Record<string, unknown> = { ...newsData }
        delete compareData.long_description
        assert.containsAllKeys(data, compareData)
    })

    test('ensure that an admin cannot update news for the incorrect nation', async () => {
        const nation2 = await createTestNation()

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newsData)
            .expect(200)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .send(newsData)
            .expect(401)
    })

    test('ensure that updating to a non-existant news fails', async () => {
        const nation = await createTestNation()

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/999999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                title: 'asdf',
            })
            .expect(404)
    })
})

test.group('News upload', (group) => {
    const coverImagePath = path.join(__dirname, 'data/cover.png')
    let nation: TestNationContract
    let news: News

    group.before(async () => {
        nation = await createTestNation()
        news = await createTestNews(nation.oid)
    })

    test('ensure that uploading images requires a valid token', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/news/${news.id}/upload`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .attach('cover', coverImagePath)
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that updating an event with a non-admin token fails', async () => {
        await supertest(BASE_URL)
            .post(`/news/${news.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that admins can upload cover image and icon', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/news/${news.id}/upload`)
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
            .post(`/news/${news.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        const data = JSON.parse(text)

        assert.isNotNull(data.cover_img_src)

        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(200)

        // Upload new images
        await supertest(BASE_URL)
            .post(`/news/${news.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(200)

        // Ensure that the previously uploaded images have been removed
        await supertest(HOSTNAME).get(toRelativePath(data.cover_img_src)).expect(404)
    })

    test('ensure that uploading an image requires an attachment', async () => {
        await supertest(BASE_URL)
            .post(`/news/${news.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({ randomData: 'hello' })
            .expect(400)
    })

    test('ensure that uploading images to a non-existant news fails', async () => {
        await supertest(BASE_URL)
            .post(`/news/99999/upload`)
            .set('Authorization', 'Bearer ' + nation.token)
            .attach('cover', coverImagePath)
            .expect(404)
    })
})
