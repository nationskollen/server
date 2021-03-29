import Nation, { ActivityLevel } from 'App/Models/Nation'
import Factory from '@ioc:Adonis/Lucid/Factory'

function randomNumber(max: number, min: number) {
    return Math.floor(Math.random() * max) + min
}

export const NationFactory = Factory.define(Nation, ({ faker }) => {
    const maxCapacity = randomNumber(500, 25)
    const maxActivityLevel = Object.keys(ActivityLevel).length

    return {
        name: faker.company.companyName(),
        description: faker.lorem.paragraph(),
        address: faker.address.streetAddress(),
        maxCapacity,
        estimatedPeopleCount: randomNumber(maxCapacity, 0),
        activityLevel: randomNumber(maxActivityLevel, 0),
        accentColor: '#333333',
    }
}).build()
