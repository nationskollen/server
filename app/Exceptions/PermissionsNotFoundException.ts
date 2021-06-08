/**
 * @category Exceptions
 * @module PermissionsNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class PermissionsNotFoundException extends DefaultException {
    constructor() {
        super('Could not find permission group', 404)
    }
}
