import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { OpeningHourTypes } from 'App/Utils/Time'
import { DatabaseTables } from 'App/Utils/Database'

export default class OpeningHours extends BaseSchema {
    protected tableName = DatabaseTables.OpeningHours

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('location_id')
                .notNullable()
                .unsigned()
                .references('id')
                .inTable(DatabaseTables.Locations)
                .onDelete('CASCADE')
            table.integer('type').notNullable().unsigned().defaultTo(OpeningHourTypes.Default)
            table.integer('day').unsigned()
            table.string('day_special')
            table.dateTime('day_special_date')
            table.dateTime('open')
            table.dateTime('close')
            table.boolean('is_open').notNullable()
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
