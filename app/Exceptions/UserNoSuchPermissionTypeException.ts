/**
 * @category Exceptions
 * @module UserNoSuchPermissionTypeException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class UserNoSuchPermissionTypeException extends DefaultException {
    constructor() {
        super('Specified user does not have the specified permission type.', 400)
    }
}
