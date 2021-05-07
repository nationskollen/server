import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Menus extends BaseSchema {
    protected tableName = DatabaseTables.Menus

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
                .integer('location_id')
                .notNullable()
                .unsigned()
                .references('id')
                .inTable(DatabaseTables.Locations)
            table.string('name').notNullable()
            table.string('description')
            table.boolean('hidden').notNullable().defaultTo(false)
            table.string('cover_img_src')
            table.string('icon_img_src')
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
