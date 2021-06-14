import User from 'App/Models/User'
import { getPageNumber } from 'App/Utils/Paginate'
import { Permissions } from 'App/Utils/Permissions'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getValidatedData, getUser, getNation } from 'App/Utils/Request'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import PaginationValidator from 'App/Validators/PaginationValidator'
import UserCreateValidator from 'App/Validators/Users/CreateValidator'
import UserUpdateValidator from 'App/Validators/Users/UpdateValidator'
import UserUploadValidator from 'App/Validators/Users/UploadValidator'

export default class UsersController {
    /**
     * fetch users for a nation in the system
     */
    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const specified = await getValidatedData(request, PaginationValidator, true)
        const query = User.query().where('nation_id', oid)

        const users = await query.paginate(getPageNumber(specified.page), specified.amount)
        return users.toJSON()
    }

    /**
     * Method to retrieve a single user in the system
     */
    public async single({ request }: HttpContextContract) {
        return getUser(request).toJSON()
    }

    /**
     * Create a user for a nation specified in the route
     */
    public async create({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.User)

        const nation = getNation(request)
        const data = await getValidatedData(request, UserCreateValidator)
        const user = await nation.related('staff').create(data)

        return user.toJSON()
    }

    /**
     * Update a user model in a nation
     */
    public async update({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.User)

        const user = getUser(request)
        const changes = await getValidatedData(request, UserUpdateValidator)

        user.merge(changes)
        await user.save()

        return user.toJSON()
    }

    /**
     * Delete a user model in a nation
     */
    public async delete({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.User)

        const user = getUser(request)
        await user.delete()
    }

    /**
     * Method to upload an image to a user in the system
     */
    public async upload({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.User)

        const user = getUser(request)
        const { cover } = await getValidatedData(request, UserUploadValidator)
        const coverName = await attemptFileUpload(cover)

        if (coverName) {
            attemptFileRemoval(user.coverImgSrc)
            user.coverImgSrc = coverName
        }

        // Update cover image
        await user.save()

        return user.toJSON()
    }
}
