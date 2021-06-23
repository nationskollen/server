/**
 * @category Exceptions
 * @module ActivityLevelsDisabledException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class ActivityLevelsDisabledException extends DefaultException {
    constructor() {
        super('Activity levels has been disabled for this location.', 422)
    }
}
