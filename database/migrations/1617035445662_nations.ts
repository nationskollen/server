import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Nations extends BaseSchema {
    protected tableName = DatabaseTables.Nations

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('oid').unique().notNullable()
            table.string('name').unique().notNullable()
            table.string('short_name')
            table.string('description')
            table.string('icon_img_src')
            table.string('cover_img_src')
            table.string('accent_color').defaultTo('#333333')
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
