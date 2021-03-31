import { Exception } from '@poppinss/utils'
import { createErrorResponse } from 'App/Utils/Response'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DefaultException extends Exception {
    constructor(message: string, status: number) {
        super(message, status)
    }

    public async handle(error: this, { response }: HttpContextContract) {
        response.status(error.status).send(createErrorResponse(error.status, error.message))
    }
}
