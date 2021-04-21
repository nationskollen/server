/**
 * @category Exceptions
 * @module FileNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class FileNotFoundException extends DefaultException {
    constructor() {
        super('Could not find tmp path', 404)
    }
}
