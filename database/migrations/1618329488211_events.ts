import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Events extends BaseSchema {
    protected tableName = DatabaseTables.Events

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('nation_id')
                .notNullable()
                .unsigned()
                .references('oid')
                .inTable(DatabaseTables.Nations)
            table.text('name').notNullable()
            table.text('description')
            table.integer('location_id').unsigned()
            table.boolean('only_members')
            table.boolean('only_students')
            table.dateTime('occurs_at').notNullable()
            table.dateTime('ends_at').notNullable()
            table.string('cover_img_src')
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
