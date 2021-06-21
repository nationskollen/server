/**
 * @category Exceptions
 * @module UserNotPartOfNationException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class UserNotPartOfNationException extends DefaultException {
    constructor() {
        super('Authorized user is not admin', 401)
    }
}
