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

test.group('News fetch', () => {
    test('ensure we can fetch news', async (assert) => {
        const nation = await createTestNation()
        const news = await createTestNews(nation.oid)

        const text1 = await supertest(BASE_URL).get(`/news/${news.id}`).expect(200)

        const data1 = JSON.parse(text1.text)
        assert.isNotNull(data1)
        assert.equal(news.shortDescription, data1.short_description)
        assert.equal(news.title, data1.title)
    })

    test('ensure we can fetch all news', async (assert) => {
        const nation2 = await createTestNation()
        const nation3 = await createTestNation()

        for (let i = 0; i < 3; i++) {
            await createTestNews(nation2.oid)
        }

        for (let i = 0; i < 3; i++) {
            await createTestNews(nation3.oid)
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
            await createTestNews(nation2.oid)
        }

        for (let i = 0; i < 3; i++) {
            await createTestNews(nation3.oid)
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

    test('ensure that fetching a non-existant news fails', async () => {
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
        const compareData: Partial<News> = { ...newsData }
        delete compareData.shortDescription
        assert.containsAllKeys(data, compareData)
    })

    test('ensure that an admin cannot create news for the incorrect nation', async () => {
        const nation2 = await createTestNation()

        await supertest(BASE_URL)
            .post(`/nations/${nation2.oid}/news`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newsData)
            .expect(401)
    })

    test('ensure that validation for creating news works', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/news`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                title: 'hello',
            })
            .expect(422)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/news`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                title: 'hello',
                short_description: 'hello',
                long_description: 42,
            })
            .expect(422)
    })
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

    test('ensure that updating news requires an admin token', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(newsData)
            .expect(401)
    })

    test('ensure that admins can update news', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(newsData)
            .expect(200)

        const data = JSON.parse(text)
        const compareData: Partial<News> = { ...newsData }
        delete compareData.longDescription
        assert.containsAllKeys(data, compareData)
    })

    test('ensure that an admin cannot update news for the incorrect nation', async () => {
        const nation2 = await createTestNation()

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .send(newsData)
            .expect(401)
    })

    test('ensure that updating a non-existant news fails', async () => {
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

    test('ensure that uploading to news with a non-admin token fails', async () => {
        await supertest(BASE_URL)
            .post(`/news/${news.id}/upload`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .attach('cover', coverImagePath)
            .expect(401)
    })

    test('ensure that admins can upload cover image ', async (assert) => {
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

test.group('News Deletion', (group) => {
    let nation: TestNationContract

    group.before(async () => {
        nation = await createTestNation()
    })

    test('ensure that deleting news requires a valid token', async (assert) => {
        const news = await createTestNews(nation.oid)

        const { text } = await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)

        const data = JSON.parse(text)
        assert.isArray(data.errors)
        assert.isNotEmpty(data.errors)
    })

    test('ensure that deleting news with a non-admin token fails', async () => {
        const news = await createTestNews(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that admins can delete news', async () => {
        const news = await createTestNews(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await supertest(BASE_URL).get(`/news/${news.id}`).expect(404)
    })

    test('ensure that deleting non-existant news fails', async () => {
        await supertest(BASE_URL)
            .delete(`/news/99999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that an admin cannot delete news for the incorrect nation', async () => {
        const nation2 = await createTestNation()
        const news = await createTestNews(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/news/${news.id}`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .expect(401)
    })
})
