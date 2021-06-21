/**
 * @category Exceptions
 * @module NotAdminException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class NotAdminException extends DefaultException {
    constructor() {
        super('Insufficient permissions to perform this action', 401)
    }
}
