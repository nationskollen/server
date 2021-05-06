import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { createTestCategory } from 'App/Utils/Test'

test.group('Categories fetch', async () => {
    test('ensure that you can fetch all the categories in the system', async (assert) => {
        const numberOfCategoriesInTest = 6
        await createTestCategory()
        await createTestCategory()
        await createTestCategory()
        await createTestCategory()
        await createTestCategory()
        await createTestCategory()

        const { text } = await supertest(BASE_URL).get(`/categories`).expect(200)

        const data = JSON.parse(text)

        assert.lengthOf(data, numberOfCategoriesInTest)
    })
})
