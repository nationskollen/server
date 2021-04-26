import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Subscriptions extends BaseSchema {
    protected tableName = DatabaseTables.Subscriptions

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('nation_id')
                .notNullable()
                .unsigned()
                .references('oid')
                .inTable(DatabaseTables.Nations)
            table
                .integer('push_token_id')
                .notNullable()
                .unsigned()
                .references('id')
                .inTable(DatabaseTables.PushTokens)
            table
                .integer('subscription_topic_id')
                .notNullable()
                .unsigned()
                .references('id')
                .inTable(DatabaseTables.SubscriptionTopics)
            table.string('uuid').notNullable().unique()
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
