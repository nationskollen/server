import { Exception } from '@poppinss/utils'
import { createErrorResponse } from 'App/Utils/Response'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InternalErrorException extends Exception {
    constructor(message: string) {
        super(message, 500)
    }

    public async handle(error: this, { response }: HttpContextContract) {
        response.status(error.status).send(createErrorResponse(error.status, error.message))
    }
}
