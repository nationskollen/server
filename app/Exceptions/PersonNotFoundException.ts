/**
 * @category Exceptions
 * @module PersonNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class PersonNotFoundException extends DefaultException {
    constructor() {
        super('Could not find person', 404)
    }
}
