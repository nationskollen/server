import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { OpeningHourTypes } from 'App/Utils/Time'

export default class OpeningHours extends BaseSchema {
    protected tableName = 'opening_hours'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('nation_id')
                .notNullable()
                .unsigned()
                .references('oid')
                .inTable('nations')
                .onDelete('CASCADE')
            table.integer('type').notNullable().unsigned().defaultTo(OpeningHourTypes.Default)
            table.integer('day').unsigned()
            table.string('day_special')
            table.string('open')
            table.string('close')
            table.boolean('is_open').notNullable()
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
