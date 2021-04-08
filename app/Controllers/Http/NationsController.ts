import Nation from 'App/Models/Nation'
import { attemptFileUpload } from 'App/Utils/Upload'
import { getNation, getValidatedData } from 'App/Utils/Request'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NationUpdateValidator from 'App/Validators/Nations/UpdateValidator'
import NationUploadValidator from 'App/Validators/Nations/UploadValidator'

export default class NationsController {
    public async index({}: HttpContextContract) {
        const nations = await Nation.allWithLocations()

        return nations.map((nation: Nation) => nation.toJSON())
    }

    public async show({ request }: HttpContextContract) {
        return getNation(request).toJSON()
    }

    public async update({ request }: HttpContextContract) {
        const changes = await getValidatedData(request, NationUpdateValidator)
        const nation = getNation(request)

        nation.merge(changes)
        await nation.save()

        return nation.toJSON()
    }

    public async upload({ request }: HttpContextContract) {
        const nation = getNation(request)
        const { cover, icon } = await getValidatedData(request, NationUploadValidator)
        const iconName = await attemptFileUpload(icon)
        const coverName = await attemptFileUpload(cover)

        if (iconName) {
            if (nation.iconImgSrc) {
                // TODO: Remove file
            }

            nation.iconImgSrc = iconName
        }

        if (coverName) {
            if (nation.coverImgSrc) {
                // TODO: Remove file
            }

            nation.coverImgSrc = coverName
        }

        await nation.save()

        return nation.toJSON()
    }
}
