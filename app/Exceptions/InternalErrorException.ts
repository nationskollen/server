import { Exception } from '@poppinss/utils'
import Logger from '@ioc:Adonis/Core/Logger'
import { createErrorResponse } from 'App/Utils/Response'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InternalErrorException extends Exception {
    constructor(message: string) {
        super(message, 500)
    }

    public async handle(error: this, { response }: HttpContextContract) {
        Logger.error(error.message)
        response.status(error.status).send(createErrorResponse(error.status, error.message))
    }
}
