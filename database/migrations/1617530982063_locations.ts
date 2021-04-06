import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Locations extends BaseSchema {
    protected tableName = 'locations'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('nation_id').notNullable().unsigned().references('oid').inTable('nations')
            table.string('name').notNullable()
            table.string('description')
            table.string('address').notNullable()
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
