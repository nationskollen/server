import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class PushTokens extends BaseSchema {
    protected tableName = DatabaseTables.PushTokens

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('token').notNullable().unique()
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
