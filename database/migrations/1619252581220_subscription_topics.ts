import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class SubscriptionTopics extends BaseSchema {
    protected tableName = DatabaseTables.SubscriptionTopics

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('name').notNullable().unique()
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
