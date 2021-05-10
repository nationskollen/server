/**
 * @category Exceptions
 * @module NotificationNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class NotificationNotFoundException extends DefaultException {
    constructor() {
        super('Could not find notification', 404)
    }
}
