/**
 * @category Exceptions
 * @module InternalErrorException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class InternalErrorException extends DefaultException {
    constructor(message: string) {
        super(message, 500)
    }
}
