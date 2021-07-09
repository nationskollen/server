import Category from 'App/Models/Category'
import { Categories } from 'App/Utils/Categories'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class CategorySeeder extends BaseSeeder {
    protected developmentOnly = false

    public async run() {
        for (const category in Categories) {
            // Make sure to only create these once, even if we rerun the seeders
            if (!isNaN(Number(category))) {
                await Category.updateOrCreate(
                    {
                        uniqueId: parseInt(category),
                    },
                    {}
                )
            }
        }
    }
}
