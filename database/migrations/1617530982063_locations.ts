import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Locations extends BaseSchema {
    protected tableName = DatabaseTables.Locations

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('nation_id')
                .notNullable()
                .unsigned()
                .references('oid')
                .inTable(DatabaseTables.Nations)
            table.string('name').notNullable()
            table.string('description')
            table.string('address').notNullable()
            table.string('latitude')
            table.string('longitude')
            table.boolean('show_on_map').notNullable().defaultTo(false)
            table.integer('max_capacity').notNullable().unsigned()
            table.integer('estimated_people_count').defaultTo(0)
            table.integer('activity_level').defaultTo(0)
            table.boolean('is_open').defaultTo(false).notNullable()
            table.string('cover_img_src')
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
