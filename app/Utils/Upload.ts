import Application from '@ioc:Adonis/Core/Application'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'

export const MAX_FILE_SIZE = '2mb'
export const ALLOWED_FILE_EXTS = ['jpg', 'png', 'jpeg']

export async function attemptFileUpload(file: MultipartFileContract | null) {
    if (!file) {
        return null
    }

    const name = `${new Date().getTime()}.${file.extname}`

    // TODO: Move to location specific for the nation and resource?
    //       This way we can overwrite (i.e. remove unused images).
    // Note that this will throw exceptions if it fails.
    // Since they are not caught, the request will error out.
    // @link https://github.com/adonisjs/bodyparser/blob/bd1891c392865f5fe77546e8ecd488b4309b1eee/src/Multipart/File.ts#L164
    await file.move(Application.publicPath(), { name })

    return name
}
