import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class MenuItems extends BaseSchema {
    protected tableName = 'menu_items'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('menu_id').notNullable().unsigned().references('id').inTable('menus')
            table.string('name').notNullable()
            table.string('description').notNullable()
            table.decimal('price', 8, 2).notNullable().unsigned().defaultTo(0)
            table.string('cover_img_src')
            table.boolean('hidden').notNullable().defaultTo(false)
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
