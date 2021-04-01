import BaseSchema from '@ioc:Adonis/Lucid/Schema'

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
            table.integer('day').notNullable().unsigned()
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
