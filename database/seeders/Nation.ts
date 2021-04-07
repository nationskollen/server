import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { NationFactory, UserFactory, MenuFactory } from '../factories'

export default class NationSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        const nations = await NationFactory.with('locations', 3, (location) => {
            location.with('openingHours', 2).with('openingHourExceptions', 1)
        })
            .merge([
                {
                    oid: 400,
                    name: 'Västmanlands-Dala nation',
                    shortName: 'V-dala',
                    accentColor: '#0053a4',
                },
                {
                    oid: 394,
                    name: 'Stockholms nation',
                    shortName: 'Stocken',
                    accentColor: '#0073bc',
                },
                {
                    oid: 405,
                    name: 'Norrlands nation',
                    shortName: 'Norrlands',
                    accentColor: '#e20e17',
                },
            ])
            .createMany(3)

        await UserFactory.merge([
            {
                email: 'admin@vdala.se',
                password: 'vdalaadmin',
                nationId: nations[0].oid,
            },
            {
                email: 'admin@stocken.se',
                password: 'stockenadmin',
                nationId: nations[1].oid,
            },
            {
                email: 'admin@norrlands.se',
                password: 'norrlandsadmin',
                nationId: nations[2].oid,
            },
        ])
            .apply('admin')
            .createMany(3)

        // TODO: Fix this hacky solution for setting the nationId
        for (const nation of nations) {
            for (const location of nation.locations) {
                await MenuFactory.with('items', 3)
                    .merge({ locationId: location.id, nationId: nation.oid })
                    .createMany(3)
            }
        }
    }
}
