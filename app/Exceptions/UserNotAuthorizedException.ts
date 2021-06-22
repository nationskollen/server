/**
 * @category Exceptions
 * @module UserNotAuthorizedException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class UserNotAuthorizedException extends DefaultException {
    constructor() {
        super('No authorized user found', 401)
    }
}
