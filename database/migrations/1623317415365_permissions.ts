import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Permissions extends BaseSchema {
    protected tableName = DatabaseTables.Permissions

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('user_id')
                .notNullable()
                .unsigned()
                .references('id')
                .inTable(DatabaseTables.Users)
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
