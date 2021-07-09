import test from 'japa'
import supertest from 'supertest'
import * as faker from 'faker'
import { BASE_URL } from 'App/Utils/Constants'
import PushToken from 'App/Models/PushToken'
import SubscriptionTopic from 'App/Models/SubscriptionTopic'
import { PushTokenFactory, SubscriptionTopicFactory } from 'Database/factories/index'
import Env from '@ioc:Adonis/Core/Env'
import {
    TestNationContract,
    createTestNation,
} from 'App/Utils/Test'

test.group('CORS checking', async (group) => {
    let nation: TestNationContract
    let pushToken: PushToken
    let topicOne: SubscriptionTopic

    const userData = {
        full_name: faker.name.firstName(),
        email: faker.unique(faker.internet.email),
        password: faker.internet.password(),
    }

    group.before(async () => {
        nation = await createTestNation()
        pushToken = await PushTokenFactory.create()
        topicOne = await SubscriptionTopicFactory.create()
    })

    test('ensure that CORS is enabled when in production environment, hostname is correct', async () => {
        Env.set('NODE_ENV', 'production')
        Env.set('ASSET_HOSTNAME', 'https://Nationskollen-engstrand.nu')

        // Running a CORS dependent request
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(userData)
            .expect(200)

        // Return to development
        Env.set('NODE_ENV', 'development')
    })

    test('ensure that CORS is enabled when in production environment, hostname invalid', async () => {
        Env.set('NODE_ENV', 'production')

        // Running random CORS inflicted request
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/users`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(userData)
            .expect(422)

        Env.set('NODE_ENV', 'development')
    })

    test('ensure that CORS is disabled when creating a subscription', async () => {
        await supertest(BASE_URL)
            .post(`/subscriptions`)
            .send({
                oid: nation.oid,
                token: pushToken.token,
                topic: topicOne.id,
            })
            .expect(200)
    })
})
