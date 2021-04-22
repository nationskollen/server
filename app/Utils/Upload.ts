/**
 * ## Utils for uploading to the server.
 * Here are different stub- or helper functions that are used in the system in
 * order to implement the upload feature to the server.
 *
 * The allowed filetypes for uploading are specified in the `ALLOWED_FILE_EXTS`:
 *
 * - `jpg`
 * - `png`
 * - `jpeg`
 * - `gif`
 *
 * @category Utils
 * @module Upload
 */

import fs from 'fs'
import sharp from 'sharp'
import crypto from 'crypto'
import Logger from '@ioc:Adonis/Core/Logger'
import UPLOAD_QUALITY_VALUE from 'App/Utils/Constants'
import Application from '@ioc:Adonis/Core/Application'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import FileNotFoundException from 'App/Exceptions/FileNotFoundException'

/**
 * @constant `MAX_FILE_SIZE` Specifies the maximum size for uploading a file
 */
export const MAX_FILE_SIZE = '3mb'
// TODO: add .svg?
/**
 * @constant `ALLOWED_FILE_EXTS` Specifies which file extentions that are allowed in the system
 */
export const ALLOWED_FILE_EXTS = ['jpg', 'png', 'jpeg', 'gif']

/**
 * Attempts a file upload to the server with a given file
 * @param file
 */
export async function attemptFileUpload(file?: MultipartFileContract) {
    if (!file) {
        return null
    }

    // https://stackoverflow.com/questions/9407892/how-to-generate-random-sha1-hash-to-use-as-id-in-node-js
    // This is decently fast and has an almost 0 chance of collisions.
    const currentDate = new Date().valueOf().toString()
    const random = Math.random().toString()
    const hash = crypto
        .createHash('sha1')
        .update(currentDate + random)
        .digest('hex')
    const name = `${hash}.${file.extname}`

    if (!file.tmpPath) {
        throw new FileNotFoundException()
    }

    if (file.extname === 'gif'){
        // Note that this will throw exceptions if it fails.
        // Since they are not caught, the request will error out.
        // @link https://github.com/adonisjs/bodyparser/blob/bd1891c392865f5fe77546e8ecd488b4309b1eee/src/Multipart/File.ts#L164
        // TODO: Must be enabled if file ext is gif
        await file?.move(Application.publicPath(), { name })
        return name
    }

    // If it is not a gif, then we will simply use our file-compressor
    await compressFile(file.tmpPath, name, file.extname)
    return name
}

/**
 * Attempts a file removal from the server with a given filename
 * @param name name of the file to remove from the system
 */
export function attemptFileRemoval(name?: string) {
    if (!name) {
        return
    }

    const path = Application.publicPath(name)

    // Verify that the path exists
    if (!fs.existsSync(path)) {
        return
    }

    try {
        fs.unlinkSync(path)
    } catch (e) {
        Logger.error('Could not remove uploaded file:', e)
    }
}

/**
 * Compresses a file
 * @todo Add new field in models for a mobile optimized image
 *
 * @param tmpPath The path where sharp will find the file
 * @param outName The name of the output file after compression
 * @param extName The extention in the input file
 */
export async function compressFile(tmpPath: string, outName: string, extName?: string) {
    if (extName === 'png') {
        await sharp(tmpPath).png({ quality: UPLOAD_QUALITY_VALUE }).toFile(Application.publicPath(outName))
    } else {
        await sharp(tmpPath).jpeg({ quality: UPLOAD_QUALITY_VALUE }).toFile(Application.publicPath(outName))
    }
}
