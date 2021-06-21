/**
 * @category Exceptions
 * @module UserNotPartOfNationException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class UserAlreadyHasPermissionException extends DefaultException {
    constructor() {
        super('Specified user already has the specified permission type.', 400)
    }
}
