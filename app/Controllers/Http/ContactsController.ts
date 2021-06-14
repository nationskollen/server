/**
 * The ContactsController contains the different methods that gives the ability
 * to operate upon {@link Contact | Contact} models.
 *
 * @category Controller
 * @module ContactsController
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Permissions } from 'App/Utils/Permissions'
import { getContact, getNation, getValidatedData } from 'App/Utils/Request'
import ContactCreateValidator from 'App/Validators/Contacts/CreateValidator'
import ContactUpdateValidator from 'App/Validators/Contacts/UpdateValidator'
import Contact from 'App/Models/Contact'

export default class ContactsController {
    /**
     * fetch contact infromation for a nation in from system
     */
    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const contactInformation = await Contact.findBy('nation_id', oid)

        return contactInformation
    }

    /**
     * Create a contacts model for a nation specified in the route
     */
    public async create({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.Contact)

        const nation = getNation(request)
        const data = await getValidatedData(request, ContactCreateValidator)

        const contactInformation = await nation
            .related('contact')
            .updateOrCreate({ nationId: nation.oid }, data)

        return contactInformation.toJSON()
    }

    /**
     * Update a contacts model in a nation
     */
    public async update({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.Contact)

        const contact = getContact(request)
        const changes = await getValidatedData(request, ContactUpdateValidator)

        contact.merge(changes)
        await contact.save()

        return contact.toJSON()
    }

    /**
     * Delete a contacts model in a nation
     */
    public async delete({ bouncer, request }: HttpContextContract) {
        await bouncer.authorize('permissionRights', Permissions.Contact)

        const contact = getContact(request)
        await contact.delete()
    }
}
