/**
 * @category Exceptions
 * @module EventNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class EventNotFoundException extends DefaultException {
    constructor() {
        super('Could not find news or message', 404)
    }
}
