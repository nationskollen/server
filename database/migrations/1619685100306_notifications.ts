import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Notifications extends BaseSchema {
    protected tableName = 'notifications'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('title').notNullable()
            table.string('message').notNullable()
            table
                .integer('nation_id')
                .notNullable()
                .unsigned()
                .references('oid')
                .inTable(DatabaseTables.Nations)
            // table
            //     .integer('subscription_topic_id')
            //     .notNullable()
            //     .unsigned()
            //     .references('id')
            //     .inTable(DatabaseTables.SubscriptionTopics)
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
