/**
 * @category Exceptions
 * @module PermissionDataNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class PermissionDataNotFoundException extends DefaultException {
    constructor() {
        super('PermissionData not found.', 404)
    }
}
