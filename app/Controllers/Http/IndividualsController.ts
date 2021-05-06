/**
 * The IndividualsController contains all the methods that are available to perform
 * on {@link Individual | Individual models} in the system.
 *
 * Only an admin of a nation can perform the given operations on its own individuals.
 *
 * @category Controller
 * @module IndividualsController
 */
import Individual from 'App/Models/Individual'
import { getIndividual, getNation, getValidatedData } from 'App/Utils/Request'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import IndividualCreateValidator from 'App/Validators/Individuals/CreateValidator'
import IndividualUpdateValidator from 'App/Validators/Individuals/UpdateValidator'
import IndividualUploadValidator from 'App/Validators/Individuals/UploadValidator'

export default class IndividualsController {
    /**
     * fetch all individuals from system
     */
    public async index({}: HttpContextContract) {
        const individuals = await Individual.query().apply((scopes) => {
            scopes.inOrder()
        })
        return individuals.map((individual: Individual) => individual.toJSON())
    }

    /**
     * fetch a single individual from system
     */
    public async single({ request }: HttpContextContract) {
        return getIndividual(request).toJSON()
    }

    /**
     * create a single individual
     */
    public async create({ request }: HttpContextContract) {
        const nation = getNation(request)
        const data = await getValidatedData(request, IndividualCreateValidator)

        const individual = await nation.related('individuals').create(data)

        return individual.toJSON()
    }

    /**
     * update a individual from system
     */
    public async update({ request }: HttpContextContract) {
        const changes = await getValidatedData(request, IndividualUpdateValidator)
        const individual = getIndividual(request)

        individual.merge(changes)
        await individual.save()

        return individual.toJSON()
    }

    /**
     * delete a single individual from system
     */
    public async delete({ request }: HttpContextContract) {
        const individual = getIndividual(request)
        await individual.delete()
    }

    /**
     * upload a file to a individual from system
     */
    public async upload({ request }: HttpContextContract) {
        const individual = getIndividual(request)
        const { cover } = await getValidatedData(request, IndividualUploadValidator)
        const coverName = await attemptFileUpload(cover)

        if (coverName) {
            attemptFileRemoval(individual.coverImgSrc)
            individual.coverImgSrc = coverName
        }

        await individual.save()

        return individual.toJSON()
    }
}
