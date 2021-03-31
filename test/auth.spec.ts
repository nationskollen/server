import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/User'
import { BASE_URL } from 'App/Utils/Constants'
import { NationFactory, UserFactory } from 'Database/factories/index'
import { createStaffUser } from 'App/Utils/Test'
import { NationOwnerScopes } from 'App/Utils/Scopes'

test.group('Auth', () => {
    test('ensure user can login', async (assert) => {
        // Create new user
        const password = 'password123'
        const user = await UserFactory.merge({ password }).create()

        const { text } = await supertest(BASE_URL)
            .post('/user/login')
            .expect('Content-Type', /json/)
            .send({
                email: user.email,
                password: password,
            })
            .expect(200)

        const data = JSON.parse(text)

        assert.isString(data.token)
        assert.equal(data.type, 'bearer')
    })

    test('ensure email is validated', async (assert) => {
        await supertest(BASE_URL)
            .post('/user/login')
            .expect('Content-Type', /json/)
            .send({
                email: 'admin',
                password: '12345678',
            })
            .expect(422)
    })

    test('ensure password is validated', async (assert) => {
        await supertest(BASE_URL)
            .post('/user/login')
            .expect('Content-Type', /json/)
            .send({
                email: 'admin@test.com',
                password: '123',
            })
            .expect(422)
    })

    test('ensure both email and password is validated', async (assert) => {
        await supertest(BASE_URL)
            .post('/user/login')
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
            email,
            password: '12345678',
        })

        assert.equal(user.email, email)
    })

    test('ensure user password gets hashed during save', async (assert) => {
        const user = await User.create({
            email: 'test@test.com',
            password: '12345678',
        })

        assert.notEqual(user.password, 'secret')
    })

    test('ensure that server response that a user is admin', async (assert) => {
        const { oid } = await NationFactory.create()
        const { scope } = await createStaffUser(oid, true)

        assert.equal(scope, NationOwnerScopes.Admin)
    })

    test('ensure that server response that a user is staff', async (assert) => {
        const { oid } = await NationFactory.create()
        const { scope } = await createStaffUser(oid, false)

        assert.equal(scope, NationOwnerScopes.Staff)
    })

    test('ensure that server response that a user is not a member of nation', async (assert) => {
        const { scope } = await createStaffUser(-1, false)
        assert.equal(scope, NationOwnerScopes.None)
    })
})
