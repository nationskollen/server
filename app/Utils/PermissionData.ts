import User from 'App/Models/User'
import Permission from 'App/Models/Permission'
import PermissionType from 'App/Models/PermissionType'

export default interface PermissionData {
    user: User
    permission: Permission | null
    permissionType: PermissionType | null
    options: string[] | null
}
