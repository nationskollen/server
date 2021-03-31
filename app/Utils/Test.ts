import { UserFactory } from 'Database/factories/index'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'

export async function createStaffUser(nationId: number, nationAdmin: boolean) {
    const password = 'randomuserpassword'
    const user = await UserFactory.merge({ password, nationId, nationAdmin }).create()

    const { text } = await supertest(BASE_URL)
        .post(`/user/login`)
        .send({ email: user.email, password })
        .expect(200)

    const { token, scope } = JSON.parse(text)

    return {
        user,
        token,
        scope,
    }
}
