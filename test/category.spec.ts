import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { createTestCategory } from 'App/Utils/Test'
import { Categories } from 'App/Utils/Categories'

test.group('Categories fetch', async () => {
    test('ensure that you can fetch all the categories in the system', async (assert) => {
        const numberOfCategoriesInTest = 2
        for (let i = 0; i < numberOfCategoriesInTest; i++) {
            await createTestCategory()
        }

        const { text } = await supertest(BASE_URL).get(`/categories`).expect(200)

        const data = JSON.parse(text)

        assert.lengthOf(data, numberOfCategoriesInTest + Object.keys(Categories).length / 2)
    })
})
