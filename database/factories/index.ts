import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Nation from 'App/Models/Nation'
import Location from 'App/Models/Location'
import Factory from '@ioc:Adonis/Lucid/Factory'
import OpeningHour from 'App/Models/OpeningHour'
import { OpeningHourTypes } from 'App/Utils/Time'
import { MAX_ACTIVITY_LEVEL } from 'App/Utils/Activity'

export const UserFactory = Factory.define(User, ({ faker }) => {
    return {
        email: faker.internet.email(),
        password: faker.internet.password(),
        nationAdmin: false,
    }
})
    .state('admin', (user) => (user.nationAdmin = true))
    .build()

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
        maxCapacity,
        estimatedPeopleCount: faker.datatype.number(maxCapacity),
        activityLevel: faker.datatype.number(MAX_ACTIVITY_LEVEL),
        isOpen: faker.datatype.boolean(),
    }
})
    .relation('openingHours', () => OpeningHourFactory)
    .relation('openingHourExceptions', () => OpeningHourExceptionFactory)
    .build()

export const NationFactory = Factory.define(Nation, async ({ faker }) => {
    return {
        oid: faker.unique(faker.datatype.number, [{ min: 0, max: 1000 }]),
        name: faker.company.companyName(),
        shortName: faker.company.companyName(),
        description: faker.lorem.paragraph(),
        accentColor: faker.internet.color(),
        coverImgSrc: faker.image.imageUrl(),
        iconImgSrc: faker.image.avatar(),
    }
})
    .relation('staff', () => UserFactory)
    .relation('locations', () => LocationFactory)
    .build()
