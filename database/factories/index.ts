import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Menu from 'App/Models/Menu'
import News from 'App/Models/News'
import Event from 'App/Models/Event'
import Nation from 'App/Models/Nation'
import MenuItem from 'App/Models/MenuItem'
import PermissionType from 'App/Models/PermissionType'
import Location from 'App/Models/Location'
import Contact from 'App/Models/Contact'
import PushToken from 'App/Models/PushToken'
import Individual from 'App/Models/Individual'
import OpeningHour from 'App/Models/OpeningHour'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { OpeningHourTypes } from 'App/Utils/Time'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'

export const RANDOM_IMAGES_COUNT = 30

export function getRandomImage(faker: Faker.FakerStatic) {
    const index = faker.datatype.number({ min: 1, max: RANDOM_IMAGES_COUNT })
    return `assets/random/${index}.jpg`
}

export const PushTokenFactory = Factory.define(PushToken, ({ faker }) => {
    return {
        token: `ExponentPushToken[${faker.unique(faker.git.commitSha)}]`,
    }
}).build()

export const SubscriptionTopicFactory = Factory.define(SubscriptionTopic, ({ faker }) => {
    return {
        name: faker.unique(faker.random.word),
    }
}).build()

export const EventFactory = Factory.define(Event, ({ faker }) => {
    return {
        name: faker.commerce.productName(),
        shortDescription: faker.lorem.sentence(25),
        longDescription: faker.lorem.paragraphs(10),
        onlyMembers: faker.datatype.boolean(),
        onlyStudents: faker.datatype.boolean(),
        coverImgSrc: getRandomImage(faker),
        occursAt: DateTime.fromObject({
            hour: faker.datatype.number(12),
            minute: faker.datatype.number(59),
        }),
        endsAt: DateTime.fromObject({
            hour: faker.datatype.number({ min: 13, max: 23 }),
            minute: faker.datatype.number(59),
        }),
    }
}).build()

export const MenuItemFactory = Factory.define(MenuItem, ({ faker }) => {
    return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        hidden: false,
        coverImgSrc: getRandomImage(faker),
    }
}).build()

export const PermissionsTypeFactory = Factory.define(PermissionType, ({ faker }) => {
    return {
        type: faker.name.jobType(),
    }
}).build()

export const IndividualFactory = Factory.define(Individual, ({ faker }) => {
    return {
        name: faker.name.firstName(),
        description: faker.lorem.sentence(),
        role: faker.name.jobTitle(),
    }
}).build()

export const ContactFactory = Factory.define(Contact, ({ faker }) => {
    return {
        email: faker.internet.exampleEmail(),
        telephone: faker.phone.phoneNumber(),
        webURL: faker.internet.url(),
    }
}).build()

export const MenuFactory = Factory.define(Menu, ({ faker }) => {
    return {
        name: faker.commerce.productName(),
        hidden: false,
        coverImgSrc: getRandomImage(faker),
    }
})
    .relation('items', () => MenuItemFactory)
    .build()

export const NewsFactory = Factory.define(News, ({ faker }) => {
    return {
        title: faker.lorem.sentence(),
        shortDescription: faker.lorem.sentences(),
        longDescription: faker.lorem.paragraph(),
    }
}).build()

export const OpeningHourFactory = Factory.define(OpeningHour, ({ faker }) => {
    return {
        type: OpeningHourTypes.Default,
        day: faker.datatype.number(6),
        open: DateTime.fromObject({
            hour: faker.datatype.number(12),
            minute: faker.datatype.number(59),
        }),
        close: DateTime.fromObject({
            hour: faker.datatype.number({ min: 13, max: 23 }),
            minute: faker.datatype.number(59),
        }),
        isOpen: faker.datatype.boolean(),
    }
}).build()

export const OpeningHourExceptionFactory = Factory.define(OpeningHour, ({ faker }) => {
    return {
        type: OpeningHourTypes.Exception,
        daySpecial: faker.lorem.word(2),
        daySpecialDate: DateTime.fromObject({
            month: faker.datatype.number({ min: 1, max: 12 }),
            day: faker.datatype.number({ min: 1, max: 28 }),
        }),
        open: DateTime.fromObject({
            hour: faker.datatype.number(12),
            minute: faker.datatype.number(59),
        }),
        close: DateTime.fromObject({
            hour: faker.datatype.number({ min: 13, max: 23 }),
            minute: faker.datatype.number(59),
        }),
        isOpen: faker.datatype.boolean(),
    }
}).build()

export const LocationFactory = Factory.define(Location, ({ faker }) => {
    const maxCapacity = faker.datatype.number({ min: 40, max: 1000 })

    return {
        name: faker.company.companyName(),
        description: faker.lorem.paragraph(),
        address: faker.address.streetAddress(),
        latitude: parseFloat(faker.address.latitude()),
        longitude: parseFloat(faker.address.longitude()),
        showOnMap: faker.datatype.boolean(),
        maxCapacity,
        estimatedPeopleCount: faker.datatype.number(maxCapacity),
        isOpen: faker.datatype.boolean(),
    }
})
    .relation('openingHours', () => OpeningHourFactory)
    .relation('openingHourExceptions', () => OpeningHourExceptionFactory)
    .build()

export const NationFactory = Factory.define(Nation, async ({ faker }) => {
    return {
        oid: faker.unique(faker.datatype.number, [{ min: 0, max: 1000 }]),
        name: faker.unique(faker.company.companyName),
        shortName: faker.company.companyName(),
        description: faker.lorem.lines(1),
        accentColor: faker.internet.color(),
    }
})
    .relation('staff', () => UserFactory)
    .relation('locations', () => LocationFactory)
    .relation('events', () => EventFactory)
    .relation('individuals', () => IndividualFactory)
    .relation('contact', () => ContactFactory)
    .build()

export const UserFactory = Factory.define(User, ({ faker }) => {
    return {
        email: faker.internet.email(),
        fullName: faker.name.firstName(),
        password: faker.internet.password(),
        nationAdmin: false,
    }
})
    .state('admin', (user) => (user.nationAdmin = true))
    .build()
