import Nation, { ActivityLevel } from 'App/Models/Nation'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { NationFactory } from 'Database/factories'

export default class NationSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        const uniqueKey = 'name'

        await Nation.updateOrCreateMany(uniqueKey, [
            {
                oid: 400,
                name: 'Västmanlands-Dala nation',
                shortName: 'V-dala',
                description: 'V-dala är en av de större nationerna i stan..',
                address: 'S:t Larsgatan 13, 75311 Uppsala',
                maxCapacity: 200,
                estimatedPeopleCount: 100,
                activityLevel: ActivityLevel.Medium,
                accentColor: '#0053a4',
            },
            {
                oid: 394,
                name: 'Stockholms nation',
                shortName: 'Stocken',
                description: 'Stockholms nation grundades 1649 och..',
                address: 'Drottninggatan 11, 75310 Uppsala',
                maxCapacity: 300,
                estimatedPeopleCount: 0,
                activityLevel: ActivityLevel.Closed,
                accentColor: '#0073bc',
            },
            {
                oid: 405,
                name: 'Norrlands nation',
                shortName: 'Norrlands',
                description: 'Välkommen till världens största studentnation!..',
                address: 'Västra Ågatan 13, 75309 Uppsala',
                maxCapacity: 150,
                estimatedPeopleCount: 130,
                activityLevel: ActivityLevel.High,
                accentColor: '#e20e17',
            },
        ])
    }
}