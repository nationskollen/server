import fs from 'fs'
import path from 'path'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class ClearAssets extends BaseCommand {
    // Command Name is used to run the command
    public static commandName = 'clear:assets'

    // Command Name is displayed in the "help" output
    public static description = 'Deletes all static assets from public/'

    public async run() {
        const publicPath = path.join(__dirname, '../public')

        await new Promise<void>((resolve, _) => {
            fs.readdir(publicPath, (err, files) => {
                if (err) throw err

                for (const file of files) {
                    if (file === '.keep') continue

                    fs.unlink(path.join(publicPath, file), (err) => {
                        if (err) throw err
                        this.logger.info(`Deleted ${file}`)
                    })
                }

                resolve()
            })
        })
    }
}
