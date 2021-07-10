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

async function runPermissionCategoriesSeeding() {
    await execa.node('ace', ['db:seed', '--files', './database/seeders/PermissionType.ts'], {
        stdio: 'inherit',
    })
    await execa.node('ace', ['db:seed', '--files', './database/seeders/Category.ts'], {
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
    return ['test/**/*.spec.ts']

    // Below is for running a single test file. This is because we now have a
    // lot of tests and running them takes time. If you want to test something
    // quick, you can uncomment the following line and specify the test file.
    // Remember to comment out this and then run all the tests.
    // return ['test/events.spec.ts']


// Configure test runner
configure({
    files: getTestFilesPattern(),
    before: [
        clearAssets,
        rollbackMigrations,
        runMigrations,
        startHttpServer,
        runPermissionCategoriesSeeding,
    ],
    after: [rollbackMigrations, runMigrations, runSeeding, clearAssets],
})
