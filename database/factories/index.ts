import Factory from '@ioc:Adonis/Lucid/Factory'

import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Nation from 'App/Models/Nation'
import OpeningHour from 'App/Models/OpeningHour'
import { ActivityLevels } from 'App/Utils/Activity'
import { OpeningHourTypes } from 'App/Utils/Time'

function randomNumber(max: number, min: number) {
    return Math.floor(Math.random() * max) + min
}

export const UserFactory = Factory.define(User, ({ faker }) => {
    return {
        email: faker.internet.email(),
        password: faker.internet.password(),
        nationAdmin: false,
    }
})
    .state('admin', (user) => (user.nationAdmin = true))
    .build()

export const OpeningHourFactory = Factory.define(OpeningHour, () => {
    const open = DateTime.fromObject({ hour: randomNumber(23, 0), minute: randomNumber(59, 0) })
    const close = DateTime.fromObject({ hour: randomNumber(23, 0), minute: randomNumber(59, 0) })
    const day = randomNumber(6, 0)

    return {
        day,
        type: OpeningHourTypes.Default,
        open,
        close,
        isOpen: true,
    }
})
    .state('closed', (data) => (data.isOpen = false))
    .state('exception', (data) => {
        data.type = OpeningHourTypes.Exception
        data.daySpecial = 'Random holiday'
    })
    .build()

export const NationFactory = Factory.define(Nation, async ({ faker }) => {
    const maxCapacity = randomNumber(500, 25)
    const maxActivityLevel = Object.keys(ActivityLevels).length - 1

    return {
        oid: randomNumber(100000, 0),
        name: faker.company.companyName(),
        description: faker.lorem.paragraph(),
        address: faker.address.streetAddress(),
        maxCapacity,
        estimatedPeopleCount: randomNumber(maxCapacity, 0),
        activityLevel: randomNumber(maxActivityLevel, 0),
        accentColor: '#333333',
    }
})
    .relation('staff', () => UserFactory)
    .relation('openingHours', () => OpeningHourFactory)
    .relation('openingHourExceptions', () => OpeningHourFactory)
    .before('create', (_, model: Nation) => {
        // Make sure that the oid is unique or tests will fail
        const nation = Nation.findBy('oid', model.oid)

        if (!nation) {
            return
        }

        // Regenerate the oid
        model.oid = randomNumber(100000, 0)
    })
    .build()
