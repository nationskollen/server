/**
 * @category Exceptions
 * @module UserNotPartOfNationException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class UserAlreadyNationAdminException extends DefaultException {
    constructor() {
        super('Specified user is a nation admin, cannot perform permission changes.', 401)
    }
}
