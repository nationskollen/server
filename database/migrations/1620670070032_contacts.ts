import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Contacts extends BaseSchema {
    protected tableName = DatabaseTables.Contacts

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('email').notNullable()
            table.string('telephone').notNullable()
            table.string('web_url')
            table
                .integer('nation_id')
                .notNullable()
                .unsigned()
                .references('oid')
                .inTable(DatabaseTables.Nations)
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
