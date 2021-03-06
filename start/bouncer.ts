/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Permission from 'App/Models/Permission'
import PermissionType from 'App/Models/PermissionType'

/*
|--------------------------------------------------------------------------
| Bouncer Actions
|--------------------------------------------------------------------------
|
| Actions allows you to separate your application business logic from the
| authorization logic. Feel free to make use of policies when you find
| yourself creating too many actions
|
| You can define an action using the `.define` method on the Bouncer object
| as shown in the following example
|
| ```
| 	Bouncer.define('deletePost', (user: User, post: Post) => {
|			return post.user_id === user.id
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "actions" const from this file
|****************************************************************
*/
export const { actions } = Bouncer
    // Defined action can be used at any controller that exists in the system
    .define(
        'permissions',
        async (user: User | undefined, permission: string, oid: number | undefined) => {
            if (!user) {
                return Bouncer.deny('Permission denied, user undefined', 401)
            }

            if (!oid) {
                return Bouncer.deny('Permission denied, nation id undefined', 401)
            }

            if (user.nationId != oid) {
                return Bouncer.deny('Permission denied, user does not belong to nation id', 401)
            }

            // Extract the permission
            const type = await PermissionType.findBy('type', permission)
            if (!type) {
                return Bouncer.deny(
                    'Permission denied, specified permission type is undefined',
                    401
                )
            }

            // Make sure if a nation admin is performing the update, it is performed in the same nation
            if (user.nationAdmin) {
                return true
            }

            // We query for the permission in order to check if the user
            // performing the action has sufficient permissions.
            const query = await Permission.query()
                .where('user_id', user.id)
                .where('permission_type_id', type.id)
                .first()

            if (!query) {
                return Bouncer.deny('Permission denied, Insufficient permission rights', 401)
            }

            return true
        }
    )
    .define(
        'hasPermission',
        async (authorizedUser: User | undefined, permissionType: PermissionType | null) => {
            if (!authorizedUser) {
                return Bouncer.deny('Permission denied, authorized user undefined', 401)
            }

            // Make sure if a nation admin is performing the action.
            if (authorizedUser.nationAdmin) {
                return true
            }

            // Check so that the provided type is defined
            if (!permissionType) {
                return Bouncer.deny(
                    'Permission denied, specified permission type is undefined',
                    401
                )
            }

            // We query for the permission in authorized user in order to check
            // if the user performing the action has sufficient permissions.
            const query = await Permission.query()
                .where('user_id', authorizedUser.id)
                .where('permission_type_id', permissionType.id)
                .first()

            if (!query) {
                return Bouncer.deny('Permission denied, Insufficient permission rights', 401)
            }

            return true
        }
    )
    .define('notSelf', async (authorizedUser: User | undefined, requestedUserId: number) => {
        if (!authorizedUser) {
            return Bouncer.deny('Permission denied, authorized user undefined', 401)
        }

        if (!requestedUserId) {
            return Bouncer.deny('Permission denied, requested user id undefined', 401)
        }

        if (authorizedUser.id === requestedUserId) {
            return Bouncer.deny(
                'Permission denied, not allowed to delete currently authorized user',
                401
            )
        }

        return true
    })
/*
|--------------------------------------------------------------------------
| Bouncer Policies
|--------------------------------------------------------------------------
|
| Policies are self contained actions for a given resource. For example: You
| can create a policy for a "User" resource, one policy for a "Post" resource
| and so on.
|
| The "registerPolicies" accepts a unique policy name and a function to lazy
| import the policy
|
| ```
| 	Bouncer.registerPolicies({
|			UserPolicy: () => import('App/Policies/User'),
| 		PostPolicy: () => import('App/Policies/Post')
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "policies" const from this file
|****************************************************************
*/
export const { policies } = Bouncer.registerPolicies({})
