import test from 'japa'
import User from 'App/Models/User'

test.group('Auth', () => {
    test('ensure user email is saved correctly', async (assert) => {
        const email = 'test@test.com'

        const user = await User.create({
            email,
            password: 'secret',
        })

        assert.equal(user.email, email)
    })

    test('ensure user password gets hashed during save', async (assert) => {
        const user = await User.create({
            email: 'test@test.com',
            password: 'secret',
        })

        assert.notEqual(user.password, 'secret')
    })
})
