import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Menus extends BaseSchema {
    protected tableName = 'menus'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('nation_id').notNullable().unsigned().references('oid').inTable('nations')
            table
                .integer('location_id')
                .notNullable()
                .unsigned()
                .references('id')
                .inTable('locations')
            table.string('name').notNullable()
            table.boolean('hidden').notNullable().defaultTo(false)
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
