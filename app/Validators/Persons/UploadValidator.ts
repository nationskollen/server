/**
 * @category Validator
 * @module PersonUploadValidator
 */
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MAX_FILE_SIZE, ALLOWED_FILE_EXTS } from 'App/Utils/Upload'

export default class PersonUploadValidator {
    constructor(protected ctx: HttpContextContract) {}

    public schema = schema.create({
        cover: schema.file.optional({
            size: MAX_FILE_SIZE,
            extnames: ALLOWED_FILE_EXTS,
        }),
    })
    public messages = {}
}
