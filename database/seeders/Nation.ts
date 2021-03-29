import Nation, { ActivityLevel } from 'App/Models/Nation'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { NationFactory } from 'Database/factories'

export default class NationSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run () {
        const uniqueKey = 'name'

        await Nation.updateOrCreateMany(uniqueKey, [
            {
                name: 'Västmanlands-Dala nation',
                shortName: 'V-dala',
                description: 'V-dala är en av de större nationerna i stan..',
                address: 'S:t Larsgatan 13, 75311 Uppsala',
                maxCapacity: 200,
                estimatedPeopleCount: 100,
                activityLevel: ActivityLevel.Medium,
                accentColor: '#0053a4',
            }
        ])
    }
}
