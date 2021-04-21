/**
 * @category Exceptions
 * @module MenuItemNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class MenuItemNotFoundException extends DefaultException {
    constructor() {
        super('Could not find menu item', 404)
    }
}
