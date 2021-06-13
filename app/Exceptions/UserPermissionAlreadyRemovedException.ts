/**
 * @category Exceptions
 * @module UserPermissionAlreadyRemovedException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class UserPermissionAlreadyRemovedException extends DefaultException {
    constructor() {
        super('Specified user already has the specified permission type removed.', 400)
    }
}
