import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { UserFactory, NationFactory } from 'Database/factories/index'

export interface TestNationContract {
    oid: number
    maxCapacity: number
    estimatedPeopleCount: number
    token: string
    staffToken: string
    adminOtherToken: string
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
    const nation = await NationFactory.create()
    const admin = await createStaffUser(nation.oid, true)
    const adminOther = await createStaffUser(nation.oid + 1, true)
    const staff = await createStaffUser(nation.oid, false)

    return {
        oid: nation.oid,
        maxCapacity: nation.maxCapacity,
        estimatedPeopleCount: nation.estimatedPeopleCount,
        token: admin.token,
        staffToken: staff.token,
        adminOtherToken: adminOther.token,
    }
}
