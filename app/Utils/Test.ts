import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { UserFactory, NationFactory } from 'Database/factories/index'

export interface TestNationContract {
    oid: number
    token: string
    staffToken: string
}

export async function createStaffUser(nationId: number, nationAdmin: boolean) {
    const password = 'randomuserpassword'
    const user = await UserFactory.merge({ password, nationId, nationAdmin }).create()

    const { text } = await supertest(BASE_URL)
        .post(`/user/login`)
        .send({ email: user.email, password })
        .expect(200)

    const { token, scope, oid } = JSON.parse(text)

    return {
        user,
        token,
        scope,
        oid,
    }
}

export async function createTestNation(): Promise<TestNationContract> {
    const { oid } = await NationFactory.create()
    const admin = await createStaffUser(oid, true)
    const staff = await createStaffUser(oid, false)

    return {
        oid,
        token: admin.token,
        staffToken: staff.token,
    }
}
