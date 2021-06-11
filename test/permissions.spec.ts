import test from 'japa'
import supertest from 'supertest'
import Permission from 'App/Models/Permission'
import { BASE_URL } from 'App/Utils/Constants'
import {
    TestNationContract,
    createTestNation,
    createTestPermissions,
    createTestUser,
} from 'App/Utils/Test'

test.group('Permissions fetch', (group) => {
    let nation: TestNationContract
    const numberOfPermissionsInTest = 5

    group.before(async () => {
        nation = await createTestNation()
        for (let i = 0; i < numberOfPermissionsInTest; i++) {
            await createTestPermissions()
        }
    })

    test('ensure we can fetch permissions in system', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .get(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        const data = JSON.parse(text)
        assert.isNotNull(data)
        assert.equal(data.length, numberOfPermissionsInTest)
    })
})

test.group('Permissions add', async (group) => {
    let nation: TestNationContract
    const numberOfPermissionsInTest = 5

    group.before(async () => {
        nation = await createTestNation()
        for (let i = 0; i < numberOfPermissionsInTest; i++) {
            await createTestPermissions()
        }
    })

    test('ensure we can add a user permission(s)', async (assert) => {
        const user = await createTestUser(nation.oid, false)
        const permission = await createTestPermissions()

        const { text } = await supertest(BASE_URL)
            .post(`/permissions`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                user_id: user.id,
                permission: permission.id,
            })
            .expect(200)

        const data = JSON.parse(text)
        const userPermission = await Permission.findBy('user_id', data.id)
        assert.equal()
    })
})

test.group('Permissions remove', async () => {})
