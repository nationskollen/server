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
            table.text('short_description').notNullable()
            table.text('long_description').notNullable()
            table.integer('location_id').unsigned()
            table.boolean('only_members').defaultTo(false)
            table.boolean('only_students').defaultTo(false)
            table
                .integer('category_id')
                .unsigned()
                .references('id')
                .inTable(DatabaseTables.Categories)
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
