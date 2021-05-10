/**
 * @category Exceptions
 * @module PushTokenNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class PushTokenNotFoundException extends DefaultException {
    constructor() {
        super('Could not find push token', 404)
    }
}
