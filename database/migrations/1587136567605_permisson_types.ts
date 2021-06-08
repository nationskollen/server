import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class PermissonTypes extends BaseSchema {
    protected tableName = DatabaseTables.PermissionTypes

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('name').notNullable()
            table.increments('id')
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
