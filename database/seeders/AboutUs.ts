import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import {} from '../factories'
import { Categories } from 'App/Utils/Categories'
import Category from 'App/Models/Category'

export default class AboutUsSeeder extends BaseSeeder {
    public static developmentOnly = false

    public async run() {
        // Write your database queries inside the run method
    }
}
