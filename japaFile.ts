import 'reflect-metadata'
import execa from 'execa'
import { join } from 'path'
import getPort from 'get-port'
import { configure } from 'japa'
import sourceMapSupport from 'source-map-support'

process.env.NODE_ENV = 'testing'
process.env.ADONIS_ACE_CWD = join(__dirname)
sourceMapSupport.install({ handleUncaughtExceptions: false })

async function runMigrations() {
    await execa.node('ace', ['migration:run'], {
        stdio: 'inherit',
    })
}

async function runSeeding() {
    await execa.node('ace', ['db:seed'], {
        stdio: 'inherit',
    })
}

async function rollbackMigrations() {
    await execa.node('ace', ['migration:rollback'], {
        stdio: 'inherit',
    })
}

async function clearAssets() {
    await execa.node('ace', ['clear:assets'], {
        stdio: 'inherit',
    })
}

async function startHttpServer() {
    const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
    process.env.PORT = String(await getPort())
    await new Ignitor(__dirname).httpServer().start()
}

function getTestFilesPattern() {
    // Check the current database connections
    const postgresql = process.env.DB_CONNECTION === 'pg'
    const defaultPattern = 'test/**/*.spec.ts'

    if (postgresql) {
        return [defaultPattern]
    }

    // Ignore events filtering on SQLite3 since it does not
    // support datetime filtering.
    return [defaultPattern, '!test/events-filter.spec.ts']
}

// Configure test runner
configure({
    files: getTestFilesPattern(),
    before: [clearAssets, rollbackMigrations, runMigrations, startHttpServer],
    after: [rollbackMigrations, runMigrations, runSeeding, clearAssets],
})
