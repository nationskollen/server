import User from 'App/Models/User'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class UserSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        const uniqueKey = 'email'

        await User.updateOrCreateMany(uniqueKey, [
            {
                email: 'nation@test.com',
                password: 'nation',
            },
            {
                email: 'admin@test.com',
                password: 'admin',
            },
        ])
    }
}
