import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Persons extends BaseSchema {
    protected tableName = DatabaseTables.Persons

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('nation_id')
            table.string('name')
            table.string('description')
            table.string('cover_img_src')
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
