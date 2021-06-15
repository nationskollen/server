import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { NationFactory, UserFactory, MenuFactory, LocationFactory } from '../factories'

export default class NationSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        const nations = await NationFactory.with('events', 3, (builder) => {
            builder.merge([
                {
                    categoryId: 1,
                },
                {
                    categoryId: 2,
                },
                {
                    categoryId: 3,
                },
            ])
        })
            .with('individuals', 3, (builder) => {
                builder.merge([
                    {
                        role: '1Q',
                        profileImgSrc: 'assets/fadde.jpeg',
                    },
                    {
                        role: '2Q',
                        profileImgSrc: 'assets/fredrik.jpeg',
                    },
                    {
                        role: 'Klubbmästare',
                        profileImgSrc: 'assets/johannes.jpeg',
                    },
                ])
            })
            .merge([
                {
                    oid: 400,
                    name: 'Västmanlands-Dala nation',
                    shortName: 'V-dala',
                    accentColor: '#0053a4',
                    iconImgSrc: 'assets/vdala/vdala.png',
                    coverImgSrc: 'assets/vdala/vdala-framsida.png',
                },
                {
                    oid: 394,
                    name: 'Stockholms nation',
                    shortName: 'Stocken',
                    accentColor: '#0073bc',
                    iconImgSrc: 'assets/stocken/stockholms-nation.png',
                    coverImgSrc: 'assets/stocken/stockenbaksida.jpg',
                },
                {
                    oid: 405,
                    name: 'Norrlands nation',
                    shortName: 'Norrlands',
                    accentColor: '#e20e17',
                    iconImgSrc: 'assets/norrlands/norrlandslogga.png',
                    coverImgSrc: 'assets/norrlands/norrlandsframsida.jpg',
                },
                {
                    oid: 406,
                    name: 'Kalmar nation',
                    shortName: 'Kalmars',
                    iconImgSrc: 'assets/kalmar/kalmar.png',
                    coverImgSrc: 'assets/kalmar/kalmarframsida.jpg',
                },
                {
                    oid: 407,
                    name: 'Värmlands nation',
                    shortName: 'Värmlands',
                    iconImgSrc: 'assets/varmlands/varmlands.jpg',
                    coverImgSrc: 'assets/varmlands/varmlandsframsida.jpg',
                },
                {
                    oid: 408,
                    name: 'Gästrike-Hälsinge nation',
                    shortName: "GH's",
                    iconImgSrc: 'assets/gastrike/gastrikehalsinge.png',
                    coverImgSrc: 'assets/gastrike/GH-Huset.JPG',
                },
                {
                    oid: 409,
                    name: 'Gotlands nation',
                    shortName: 'Gotlands',
                    iconImgSrc: 'assets/gotlands/gotlands.png',
                    coverImgSrc: 'assets/gotlands/gotlandsframsida.JPG',
                },
                {
                    oid: 410,
                    name: 'Uplands nation',
                    shortName: 'Uplands',
                    iconImgSrc: 'assets/uplands/uplands.png',
                    coverImgSrc: 'assets/uplands/uplandsframsida.jpg',
                },
                {
                    oid: 411,
                    name: 'Östgöta nation',
                    shortName: "ÖG's",
                    iconImgSrc: 'assets/ostgota/ostgota.png',
                    coverImgSrc: 'assets/ostgota/ostgotaframsida.jpg',
                },
                {
                    oid: 412,
                    name: 'Västgöta nation',
                    shortName: "VG's",
                    iconImgSrc: 'assets/vastgota/vastgota.png',
                    coverImgSrc: 'assets/vastgota/vastgotaframsida.jpg',
                },
                {
                    oid: 413,
                    name: 'Smålands nation',
                    shortName: 'Smålands',
                    iconImgSrc: 'assets/smalands/smalands.png',
                    coverImgSrc: 'assets/smalands/smalandsframsida.jpg',
                },
                {
                    oid: 414,
                    name: 'Göteborgs nation',
                    shortName: 'Göteborgs',
                    iconImgSrc: 'assets/gbg/gbgNation.png',
                    coverImgSrc: 'assets/gbg/gbgframsida.jpeg',
                },
                {
                    oid: 415,
                    name: 'Södermanland-Nerikes nation',
                    shortName: 'Snerkes',
                    iconImgSrc: 'assets/snarkes/snarkes.jpg',
                    coverImgSrc: 'assets/snarkes/snerikesframsida.jpg',
                },
            ])
            .createMany(13)

        await UserFactory.merge([
            {
                fullName: 'admin adminsson',
                email: 'admin@vdala.se',
                password: 'vdalaadmin',
                nationId: nations[0].oid,
            },
            {
                fullName: 'admin adminsson',
                email: 'admin@stocken.se',
                password: 'stockenadmin',
                nationId: nations[1].oid,
            },
            {
                fullName: 'admin adminsson',
                email: 'admin@norrlands.se',
                password: 'norrlandsadmin',
                nationId: nations[2].oid,
            },
        ])
            .apply('admin')
            .createMany(3)
        await UserFactory.merge([
            {
                fullName: 'staff staffsson',
                email: 'staff@vdala.se',
                password: 'vdalastaff',
                nationId: nations[0].oid,
            },
            {
                fullName: 'staff staffsson',
                email: 'staff@stocken.se',
                password: 'stockenstaff',
                nationId: nations[1].oid,
            },
            {
                fullName: 'staff staffsson',
                email: 'staff@norrlands.se',
                password: 'norrlandsstaff',
                nationId: nations[2].oid,
            },
        ]).createMany(3)

        const locations = await LocationFactory.with('openingHours', 7, (builder) => {
            builder.merge([
                {
                    day: 0,
                },
                {
                    day: 1,
                },
                {
                    day: 2,
                },
                {
                    day: 3,
                },
                {
                    day: 4,
                },
                {
                    day: 5,
                },
                {
                    day: 6,
                },
            ])
        })
            .with('openingHourExceptions', 1)
            .merge([
                {
                    name: 'Västmanland-dala nation',
                    nationId: 400,
                    isDefault: true,
                    latitude: 59.86032259136127,
                    longitude: 17.628939051847695,
                    coverImgSrc: 'assets/vdala/vdala-framsida.png',
                },
                {
                    name: 'Stockholms nation',
                    nationId: 394,
                    isDefault: true,
                    latitude: 59.856731614930446,
                    longitude: 17.63419919045771,
                    coverImgSrc: 'assets/stocken/stockenbaksida.jpg',
                },
                {
                    name: 'Norrlands nation',
                    nationId: 405,
                    isDefault: true,
                    latitude: 59.856227,
                    longitude: 17.6378425,
                    coverImgSrc: 'assets/norrlands/norrlandsframsida.jpg',
                },

                {
                    name: 'Kalmars Nation',
                    nationId: 406,
                    isDefault: true,
                    latitude: 59.859106565445636,
                    longitude: 17.62706918384986,
                    coverImgSrc: 'assets/kalmar/kalmarframsida.jpg',
                },
                {
                    name: 'Värmlands Nation',
                    nationId: 407,
                    isDefault: true,
                    latitude: 59.85715355297,
                    longitude: 17.633830648196177,
                    coverImgSrc: 'assets/varmlands/varmlandsframsida.jpg',
                },
                {
                    name: 'Gästrike-Hälsinge Nation',
                    nationId: 408,
                    isDefault: true,
                    latitude: 59.85656549537542,
                    longitude: 17.63670148804158,
                    coverImgSrc: 'assets/gastrike/GH-Huset.JPG',
                },
                {
                    name: 'Gotlands nation',
                    nationId: 409,
                    isDefault: true,
                    latitude: 59.85978279670555,
                    longitude: 17.634567704542953,
                    coverImgSrc: 'assets/gotlands/gotlandsframsida.JPG',
                },
                {
                    name: 'Uplands nation',
                    nationId: 410,
                    isDefault: true,
                    latitude: 59.85992220628584,
                    longitude: 17.629458535888315,
                    coverImgSrc: 'assets/uplands/uplandsframsida.jpg',
                },
                {
                    name: 'Östgötas nation',
                    nationId: 411,
                    isDefault: true,
                    latitude: 59.85521276094654,
                    longitude: 17.637959775927737,
                    coverImgSrc: 'assets/ostgota/ostgotaframsida.jpg',
                },
                {
                    name: 'Västgötas nation',
                    nationId: 412,
                    isDefault: true,
                    latitude: 59.85686289838122,
                    longitude: 17.638651455173623,
                    coverImgSrc: 'assets/vastgota/vastgotaframsida.jpg',
                },
                {
                    name: 'Smålands nation',
                    nationId: 413,
                    isDefault: true,
                    latitude: 59.85929959538165,
                    longitude: 17.63123586514085,
                    coverImgSrc: 'assets/smalands/smalandsframsida.jpg',
                },
                {
                    name: 'Göteborgs nation',
                    nationId: 414,
                    isDefault: true,
                    latitude: 59.85957889713392,
                    longitude: 17.63019280454616,
                    coverImgSrc: 'assets/gbg/gbgframsida.jpeg',
                },
                {
                    name: 'Södermanland-Nerikes nation',
                    nationId: 415,
                    isDefault: true,
                    latitude: 59.8591482187301,
                    longitude: 17.630697251271798,
                    coverImgSrc: 'assets/snarkes/snerikesframsida.jpg',
                },
            ])
            .createMany(13)

        for (const location of locations) {
            await MenuFactory.with('items', 3)
                .merge({
                    locationId: location.id,
                    nationId: location.nationId,
                })
                .createMany(3)
        }
    }
}
