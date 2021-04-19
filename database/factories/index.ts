import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Menu from 'App/Models/Menu'
import Nation from 'App/Models/Nation'
import MenuItem from 'App/Models/MenuItem'
import Location from 'App/Models/Location'
import Event from 'App/Models/Event'
import Factory from '@ioc:Adonis/Lucid/Factory'
import OpeningHour from 'App/Models/OpeningHour'
import { OpeningHourTypes } from 'App/Utils/Time'

export const EventFactory = Factory.define(Event, ({ faker }) => {
    return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
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
        coverImgSrc: faker.image.food(),
        hidden: false,
    }
}).build()

export const MenuFactory = Factory.define(Menu, ({ faker }) => {
    return {
        name: faker.commerce.productName(),
        hidden: false,
    }
})
    .relation('items', () => MenuItemFactory)
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
	nation_id : faker.datatype.number(maxCapacity),
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
        name: faker.company.companyName(),
        shortName: faker.company.companyName(),
        description: faker.lorem.paragraph(),
        accentColor: faker.internet.color(),
    }
})
    .relation('staff', () => UserFactory)
    .relation('locations', () => LocationFactory)
    .relation('events', () => EventFactory)
    .build()

export const UserFactory = Factory.define(User, ({ faker }) => {
    return {
        email: faker.internet.email(),
        password: faker.internet.password(),
        nationAdmin: false,
    }
})
    .state('admin', (user) => (user.nationAdmin = true))
    .build()
