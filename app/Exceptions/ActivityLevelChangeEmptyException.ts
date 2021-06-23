/**
 * @category Exceptions
 * @module ActivityLevelChangeEmptyException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class ActivityLevelChangeEmptyException extends DefaultException {
    constructor() {
        super('Unable to update activity level, empty fields when validating data', 422)
    }
}
