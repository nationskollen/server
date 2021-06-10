import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PermissionType from 'App/Models/PermissionType'
import { Permissions } from 'App/Utils/Permissions'

export default class PermissionTypeSeeder extends BaseSeeder {
    protected developmentOnly = false

    public async run() {
        for (const permission in Permissions) {
            // Make sure to only create these once, even if we rerun the seeders
            await PermissionType.updateOrCreate(
                {
                    type: permission,
                },
                {}
            )
        }
    }
}
