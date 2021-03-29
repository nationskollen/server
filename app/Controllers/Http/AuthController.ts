import UserValidator from 'App/Validators/UserValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
    public async login({ request, auth }: HttpContextContract) {
        const { email, password } = await request.validate(UserValidator)

        const token = await auth.use('api').attempt(email, password)
        return token.toJSON()
    }
}
