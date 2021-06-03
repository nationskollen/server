import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class News extends BaseSchema {
    protected tableName = DatabaseTables.News

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.timestamps(true)
            table.text('title').notNullable()
            table.text('short_description').notNullable()
            table.text('long_description').notNullable()
            table.string('cover_img_src')
            table
                .integer('nation_id')
                .notNullable()
                .unsigned()
                .references('oid')
                .inTable(DatabaseTables.Nations)
            table.integer('notification_id')
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
