/**
 * @category Exceptions
 * @module NotAdminException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class NotAdminException extends DefaultException {
    constructor() {
        super('Not enough access rights to perform action', 401)
    }
}
