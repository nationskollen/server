/**
 * The NationsController contains all the methods that are available to perform
 * on {@link Nation | nation models} in the system.
 *
 * Only an admin of a nation can perform the given operations on its own nation.
 *
 * @category Controller
 * @module NationsController
 */
import Nation from 'App/Models/Nation'
import { Permissions } from 'App/Utils/Permissions'
import { getNation, getValidatedData } from 'App/Utils/Request'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ICON_PREFIX, attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import NationUpdateValidator from 'App/Validators/Nations/UpdateValidator'
import NationUploadValidator from 'App/Validators/Nations/UploadValidator'

export default class NationsController {
    /**
     * fetch all nations from system
     */
    public async index({}: HttpContextContract) {
        const nations = await Nation.query().preload('defaultLocation')

        return nations.map((nation: Nation) => nation.toJSON())
    }

    /**
     * fetch a single nation from system
     */
    public async single({ request }: HttpContextContract) {
        return getNation(request).toJSON()
    }

    /**
     * update a nation from system
     */
    public async update({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.Nation)

        const changes = await getValidatedData(request, NationUpdateValidator)
        const nation = getNation(request)

        nation.merge(changes)
        await nation.save()

        return nation.toJSON()
    }

    /**
     * upload a file to a nation from system
     */
    public async upload({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.Nation)

        const nation = getNation(request)
        const { cover, icon } = await getValidatedData(request, NationUploadValidator)
        const iconName = await attemptFileUpload(icon, true)
        const coverName = await attemptFileUpload(cover)

        if (iconName) {
            // Remove the old paths
            attemptFileRemoval(nation.iconImgSrc)
            attemptFileRemoval(nation.pinImgSrc)

            // inser the new ones
            nation.iconImgSrc = iconName
            nation.pinImgSrc = ICON_PREFIX + iconName
        }

        if (coverName) {
            attemptFileRemoval(nation.coverImgSrc)
            nation.coverImgSrc = coverName
        }

        await nation.save()

        return nation.toJSON()
    }
}
