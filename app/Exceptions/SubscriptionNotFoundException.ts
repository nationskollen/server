/**
 * @category Exceptions
 * @module SubscriptionNotFoundException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class SubscriptionNotFoundException extends DefaultException {
    constructor() {
        super('Could not find subscription', 404)
    }
}
