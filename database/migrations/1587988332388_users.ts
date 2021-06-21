import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DatabaseTables } from 'App/Utils/Database'

export default class UsersSchema extends BaseSchema {
    protected tableName = DatabaseTables.Users

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.integer('nation_id').defaultTo(-1)
            table.string('avatar_img_src')
            table.boolean('nation_admin').defaultTo(false)
            table.string('full_name', 128).notNullable()
            table.string('email', 255).notNullable().unique()
            table.string('password', 180).notNullable()
            table.string('remember_me_token').nullable()
            table.timestamps(true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
