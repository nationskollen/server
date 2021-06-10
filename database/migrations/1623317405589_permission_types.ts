import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class PermissionTypes extends BaseSchema {
    protected tableName = DatabaseTables.PermissionTypes

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('type')
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
