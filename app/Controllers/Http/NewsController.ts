/**
 * The NewsController contains the different methods that gives the ability
 * to operate upon {@link News | News} models.
 *
 * @category Controller
 * @module NewsController
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getContact, getNation, getValidatedData } from 'App/Utils/Request'
// import ContactCreateValidator from 'App/Validators/Contacts/CreateValidator'
// import ContactUpdateValidator from 'App/Validators/Contacts/UpdateValidator'
import News from 'App/Models/News'

export default class NewsController {
    /**
     * fetch news for a nation in from system
     */
    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const newsObject = await News.findBy('nation_id', oid)

        return newsObject
    }

    /**
     * Create a news model for a nation specified in the route
     */
    public async create({ request }: HttpContextContract) {
        const nation = getNation(request)
        const data = await getValidatedData(request, ContactCreateValidator)
        const newsObject = await nation.related('news').create(data)

        // @todo
        // Add maybe a createNotification method for the news model just as its
        // used in EventsController

        return newsObject.toJSON()
    }

    /**
     * Update a news model in a nation
     */
    public async update({ request }: HttpContextContract) {
        const newsObject = getNewsObject(request)
        const changes = await getValidatedData(request, ContactUpdateValidator)

        newsObject.merge(changes)
        await newsObject.save()

        return newsObject.toJSON()
    }

    /**
     * Delete a contacts model in a nation
     */
    public async delete({ request }: HttpContextContract) {
        const contact = getContact(request)
        await contact.delete()
    }
}
