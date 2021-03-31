import User from 'App/Models/User'
import Nation, { ActivityLevel } from 'App/Models/Nation'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class NationSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        const nations = await Nation.updateOrCreateMany('name', [
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

        await User.updateOrCreateMany('email', [
            {
                email: 'admin@vdala.se',
                password: 'vdalaadmin',
                nationId: nations[0].oid,
                nationAdmin: true,
            },
            {
                email: 'admin@stocken.se',
                password: 'stockenadmin',
                nationId: nations[1].oid,
                nationAdmin: true,
            },
            {
                email: 'admin@norrlands.se',
                password: 'norrlandsadmin',
                nationId: nations[2].oid,
                nationAdmin: true,
            },
        ])
    }
}
