import test from 'japa'
import supertest from 'supertest'
import PermissionType from 'App/Models/PermissionType'
import { Permissions } from 'App/Utils/Permissions'
import User from 'App/Models/User'
import { BASE_URL } from 'App/Utils/Constants'
import { NationFactory, UserFactory } from 'Database/factories/index'
import { createTestNation, createStaffUser, assignPermissions } from 'App/Utils/Test'

test.group('Auth', () => {
    test('ensure user can login', async (assert) => {
        // Create new user
        const password = 'password123'
        const user = await UserFactory.merge({ password }).create()

        const { text } = await supertest(BASE_URL)
            .post('/users/login')
            .expect('Content-Type', /json/)
            .send({
                email: user.email,
                password: password,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.isString(data.token)
        assert.equal('bearer', data.type)
        assert.isTrue(data.hasOwnProperty('permissions'))
        assert.equal(-1, data.oid)
    })

    test('ensure email is validated', async () => {
        await supertest(BASE_URL)
            .post('/users/login')
            .expect('Content-Type', /json/)
            .send({
                email: 'admin',
                password: '12345678',
            })
            .expect(422)
    })

    test('ensure password is validated', async () => {
        await supertest(BASE_URL)
            .post('/users/login')
            .expect('Content-Type', /json/)
            .send({
                email: 'admin@test.com',
                password: '123',
            })
            .expect(422)
    })

    test('ensure both email and password is validated', async () => {
        await supertest(BASE_URL)
            .post('/users/login')
            .expect('Content-Type', /json/)
            .send({
                email: 'admin',
                password: '123',
            })
            .expect(422)
    })

    test('ensure user email is saved correctly', async (assert) => {
        const email = 'test@test.com'

        const user = await User.create({
            fullName: 'testsson',
            email,
            password: '12345678',
        })

        assert.equal(email, user.email)
    })

    test('ensure user password gets hashed during save', async (assert) => {
        const user = await UserFactory.merge({
            password: 'secret',
        }).create()

        assert.notEqual('secret', user.password)
    })

    test('ensure that logging in as admin successful', async (assert) => {
        const { oid } = await NationFactory.create()
        const data = await createStaffUser(oid, true)

        assert.isTrue(data.nation_admin)
        assert.equal(oid, data.oid)
    })

    test('ensure that logging in as staff is successful', async (assert) => {
        const { oid } = await NationFactory.create()
        const data = await createStaffUser(oid, false)

        assert.isFalse(data.nation_admin)
        assert.equal(oid, data.oid)
    })

    test('ensure that a user is logged out when "logout" action is applied', async () => {
        const nation = await NationFactory.create()
        const { token } = await createStaffUser(nation.oid, true)
        const newNationData = {
            name: 'logoutNation',
        }

        await supertest(BASE_URL)
            .post('/users/logout')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)

        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}`)
            .set('Authorization', 'Bearer ' + token)
            .send(newNationData)
            .expect(401)
    })

    test('ensure logout route is protected when logging out when not logged in', async () => {
        await supertest(BASE_URL)
            .post('/users/logout')
            .set('Authorization', 'Bearer 000000000000000')
            .expect(401)
    })

    test('ensure that permissions are in the response when logging in', async (assert) => {
        const nation = await createTestNation()
        const password = 'password123'
        const nationId = nation.oid
        const user = await UserFactory.merge({ password, nationId }).create()

        // assign some permission
        const permissions = await PermissionType.query().where('type', Permissions.UserPermissions)
        await assignPermissions(user, permissions)

        // this is to verify with the response
        await user.preload('permissions')

        const { text } = await supertest(BASE_URL)
            .post('/users/login')
            .expect('Content-Type', /json/)
            .send({
                email: user.email,
                password: password,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.equal(data.permissions[0].id, user.permissions[0].id)
        assert.equal(data.permissions[0].permission_type_id, user.permissions[0].permissionTypeId)
    })
})
