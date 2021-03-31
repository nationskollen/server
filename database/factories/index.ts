import Factory from '@ioc:Adonis/Lucid/Factory'

import User from 'App/Models/User'
import Nation from 'App/Models/Nation'
import { ActivityLevels } from 'App/Utils/Activity'

function randomNumber(max: number, min: number) {
    return Math.floor(Math.random() * max) + min
}

export const UserFactory = Factory.define(User, ({ faker }) => {
    return {
        email: faker.internet.email(),
        password: faker.internet.password(),
    }
}).build()

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
