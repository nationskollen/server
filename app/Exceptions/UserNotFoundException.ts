/**
 * @category Exceptions
 * @module UserNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class UserNotFoundException extends DefaultException {
    constructor() {
        super('User does not exist', 404)
    }
}
