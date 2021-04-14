import fs from 'fs'
import crypto from 'crypto'
import Logger from '@ioc:Adonis/Core/Logger'
import Application from '@ioc:Adonis/Core/Application'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'

export const MAX_FILE_SIZE = '3mb'
export const ALLOWED_FILE_EXTS = ['jpg', 'png', 'jpeg', 'gif']

export async function attemptFileUpload(file: MultipartFileContract | null) {
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

    // Note that this will throw exceptions if it fails.
    // Since they are not caught, the request will error out.
    // @link https://github.com/adonisjs/bodyparser/blob/bd1891c392865f5fe77546e8ecd488b4309b1eee/src/Multipart/File.ts#L164
    await file.move(Application.publicPath(), { name })

    return name
}

export function attemptFileRemoval(name: string | null) {
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
