import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { NationFactory, UserFactory, MenuFactory, LocationFactory } from '../factories'

export default class NationSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        const nations = await NationFactory.with('events', 3)
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
                {
                    oid: 406,
                    name: 'Kalmars nation',
                    shortName: 'Kalmars',
                },
                {
                    oid: 407,
                    name: 'Värmlands nation',
                    shortName: 'Värmlands',
                },
                {
                    oid: 408,
                    name: 'Gästrike-Hälsinge nation',
                    shortName: "GH's",
                },
                {
                    oid: 409,
                    name: 'Gotlands nation',
                    shortName: 'Gotlands',
                },
                {
                    oid: 410,
                    name: 'Uplands nation',
                    shortName: 'Uplands',
                },
                {
                    oid: 411,
                    name: 'Östgötas nation',
                    shortName: "ÖG's",
                },
                {
                    oid: 412,
                    name: 'Västgötas nation',
                    shortName: "VG's",
                },
                {
                    oid: 413,
                    name: 'Smålands nation',
                    shortName: 'Smålands',
                },
                {
                    oid: 414,
                    name: 'Göteborgs nation',
                    shortName: 'Göteborgs',
                },
                {
                    oid: 415,
                    name: 'Södermanland-Nerikes nation',
                    shortName: 'Snerkes',
                },
            ])
            .createMany(13)

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
        await LocationFactory.with('openingHours', 2)
            .with('openingHourExceptions', 1)
            .merge([
                {
                    name: 'Västmanland-dala nation',
                    nationId: 400,
                    latitude: 59.86032259136127,
                    longitude: 17.628939051847695,
                },
                {
                    name: 'Stockholms nation',
                    nationId: 394,
                    latitude: 59.856731614930446,
                    longitude: 17.63419919045771,
                },
                {
                    name: 'Norrlands nation',
                    nationId: 405,
                    latitude: 59.856227,
                    longitude: 17.6378425,
                },

                {
                    name: 'Kalmars Nation',
                    nationId: 406,
                    latitude: 59.859106565445636,
                    longitude: 17.62706918384986,
                },
                {
                    name: 'Värmlands Nation',
                    nationId: 407,
                    latitude: 59.85715355297,
                    longitude: 17.633830648196177,
                },
                {
                    name: 'Gästrike-Hälsinge Nation',
                    nationId: 408,
                    latitude: 59.85656549537542,
                    longitude: 17.63670148804158,
                },
                {
                    name: 'Gotlands nation',
                    nationId: 409,
                    latitude: 59.85978279670555,
                    longitude: 17.634567704542953,
                },
                {
                    name: 'Uplands nation',
                    nationId: 410,
                    latitude: 59.85992220628584,
                    longitude: 17.629458535888315,
                },
                {
                    name: 'Östgötas nation',
                    nationId: 411,
                    latitude: 59.85521276094654,
                    longitude: 17.637959775927737,
                },
                {
                    name: 'Västgötas nation',
                    nationId: 412,
                    latitude: 59.85686289838122,
                    longitude: 17.638651455173623,
                },
                {
                    name: 'Smålands nation',
                    nationId: 413,
                    latitude: 59.85929959538165,
                    longitude: 17.63123586514085,
                },
                {
                    name: 'Göteborgs nation',
                    nationId: 414,
                    latitude: 59.85957889713392,
                    longitude: 17.63019280454616,
                },
                {
                    name: 'Södermanland-Nerikes nation',
                    nationId: 415,
                    latitude: 59.8591482187301,
                    longitude: 17.630697251271798,
                },
            ])
            .createMany(13)

        for (const nation of nations) {
            if (!nation.locations) continue
            for (const location of nation.locations) {
                await MenuFactory.with('items', 3)
                    .merge({ locationId: location.id, nationId: 300 })
                    .createMany(3)
            }
        }
    }
}
