/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
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
        'permissionRights',
        async (user: User | undefined, permission: string, oid: number | undefined) => {
            if (!user) {
                return Bouncer.deny('Permission denied', 401)
            }

            // Make sure if a nationAdmin is performing the update, it is performed in the same nation
            if (user.nationAdmin && user.nationId == oid) {
                return true
            }

            if (user.nationId != oid) {
                return Bouncer.deny('Permission denied', 401)
            }

            // Extract the permissionType
            const type = await PermissionType.findBy('type', permission)
            if (!type) {
                return Bouncer.deny('Permission denied', 401)
            }

            // Load in the user permissions so that they are iterable
            await user.load('permissions')
            for (const permission of user.permissions) {
                if (type.id == permission.permissionTypeId) {
                    return true
                }
            }

            // If all fails, return false and the bouncer will throw an exception
            return Bouncer.deny('Permission denied', 401)
        }
    )

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
