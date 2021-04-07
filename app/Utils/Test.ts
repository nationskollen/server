import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import {
    UserFactory,
    MenuFactory,
    NationFactory,
    MenuItemFactory,
    LocationFactory,
    OpeningHourFactory,
    OpeningHourExceptionFactory,
} from 'Database/factories/index'

export interface TestNationContract {
    oid: number
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
        token: admin.token,
        staffToken: staff.token,
        adminOtherToken: adminOther.token,
    }
}

export async function createTestLocation(oid: number) {
    return LocationFactory.merge({ nationId: oid }).create()
}

export async function createTestOpeningHour(lid: number) {
    return OpeningHourFactory.merge({ locationId: lid }).create()
}

export async function createTestExceptionOpeningHour(lid: number) {
    return OpeningHourExceptionFactory.merge({ locationId: lid }).create()
}

export async function createTestMenu(oid: number, lid: number) {
    return MenuFactory.merge({ nationId: oid, locationId: lid }).create()
}

export async function createTestMenuItem(mid: number) {
    return MenuItemFactory.merge({ menuId: mid }).create()
}
