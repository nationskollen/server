/**
 * @category Exceptions
 * @module ContactNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class ContactNotFoundException extends DefaultException {
    constructor() {
        super('Could not find contact information in nation', 404)
    }
}
