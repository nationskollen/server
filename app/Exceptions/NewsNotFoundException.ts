/**
 * @category Exceptions
 * @module NewsNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class NewsNotFoundException extends DefaultException {
    constructor() {
        super('Could not find news or message', 404)
    }
}
