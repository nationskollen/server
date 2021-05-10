/**
 * @category Exceptions
 * @module InvalidPushTokenException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class InvalidPushTokenException extends DefaultException {
    constructor() {
        super('Invalid push token', 400)
    }
}
