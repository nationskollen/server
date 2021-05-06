/**
 * The PersonsController contains all the methods that are available to perform
 * on {@link Person | person models} in the system.
 *
 * Only an admin of a nation can perform the given operations on its own persons.
 *
 * @category Controller
 * @module PersonsController
 */
import Person from 'App/Models/Person'
import { getPerson, getValidatedData } from 'App/Utils/Request'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import PersonCreateValidator from 'App/Validators/Persons/CreateValidator'
import PersonUpdateValidator from 'App/Validators/Persons/UpdateValidator'
import PersonUploadValidator from 'App/Validators/Persons/UploadValidator'

export default class PersonsController {
    /**
     * fetch all persons from system
     */
    public async index({}: HttpContextContract) {
        const persons = await Person.all()
        // const persons = await Person.query().apply((scopes) => {
        //             scopes.inOrder()
        // })
        return persons.map((person: Person) => person.toJSON())
    }

    /**
     * fetch a single person from system
     */
    public async single({ request }: HttpContextContract) {
        return getPerson(request).toJSON()
    }

    /**
     * create a single person
     */
    public async create({ request }: HttpContextContract) {
        const data = await getValidatedData(request, PersonCreateValidator)
        // const person = await nation.related('persons').create(data)
        const person = new Person()
        person.merge(data)
        await person.save()

        return person.toJSON()
    }

    /**
     * update a person from system
     */
    public async update({ request }: HttpContextContract) {
        const changes = await getValidatedData(request, PersonUpdateValidator)
        const person = getPerson(request)

        person.merge(changes)
        await person.save()

        return person.toJSON()
    }

    /**
     * upload a file to a person from system
     */
    public async upload({ request }: HttpContextContract) {
        const person = getPerson(request)
        const { cover } = await getValidatedData(request, PersonUploadValidator)
        const coverName = await attemptFileUpload(cover)

        if (coverName) {
            attemptFileRemoval(person.coverImgSrc)
            person.coverImgSrc = coverName
        }

        await person.save()

        return person.toJSON()
    }
}
