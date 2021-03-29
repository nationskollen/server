import { Exception } from '@poppinss/utils'
import { createErrorResponse } from 'App/Utils/Response'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NotFoundException extends Exception {
    constructor(message: string) {
        super(message, 404)
    }

    public async handle(error: this, { response }: HttpContextContract) {
        response.status(error.status).send(createErrorResponse(error.status, error.message))
    }
}
