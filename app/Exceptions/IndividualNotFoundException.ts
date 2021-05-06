/**
 * @category Exceptions
 * @module IndividualNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class IndividualNotFoundException extends DefaultException {
    constructor() {
        super('Could not find individual', 404)
    }
}
