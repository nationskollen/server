import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class Events extends BaseSchema {
  protected tableName = 'events'

  public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('nation_id')
                .notNullable()
                .unsigned()
                .references('oid')
                .inTable(DatabaseTables.Nations)
            table.string('name').notNullable()
            table.string('description')
            table
                .integer('location_id')
                .notNullable()
                .unsigned()
                .references('id')
                .inTable(DatabaseTables.Locations)
            table.date('occurs_at').notNullable()
            table.date('end_at').notNullable()
            table.string('cover_img_src')
            table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
