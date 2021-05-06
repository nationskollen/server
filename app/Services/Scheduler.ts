/**
 * @category Services
 * @module Scheduler
 */
import PgBoss from 'pg-boss'
import Logger from '@ioc:Adonis/Core/Logger'
import Database from '@ioc:Adonis/Lucid/Database'

class Scheduler {
    public boss: PgBoss

    constructor() {
        // Make sure that we have a postgres connection
        if (!Database.manager.has('pg')) {
            throw new Error('Could not start scheduler. PostgreSQL is not enabled')
        }

        const node = Database.manager.get('pg')

        if (!node || !node.config) {
            throw new Error('Could not start scheduler. Missing/invalid PostgreSQL config')
        }

        // Not sure why the typings for this does not work when it obviously contains
        // the correct values?
        // @ts-ignore
        const { user, password, host, port, database } = node.config.connection

        this.boss = new PgBoss(`postgres://${user}:${password}@${host}:${port}/${database}`)
    }

    public start() {
        this.boss.start()
        this.boss.on('error', (error) => Logger.error(error.message))

        Logger.info('Scheduler started successfully')
    }
}

/**
 * This makes our service a singleton
 */
export default new Scheduler()
