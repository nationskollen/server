/**
 * @category Exceptions
 * @module MenuNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class MenuNotFoundException extends DefaultException {
    constructor() {
        super('Could not find menu', 404)
    }
}
