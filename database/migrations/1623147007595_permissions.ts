import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Permissions extends BaseSchema {
  protected tableName = DatabaseTables.Permissions

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
            table.string('type').notNullable()
      table.increments('id')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
