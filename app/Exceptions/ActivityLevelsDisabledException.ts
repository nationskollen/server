/**
 * @category Exceptions
 * @module ActivityLevelsDisabledException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class ActivityLevelsDisabledException extends DefaultException {
    constructor() {
        super('Unable to update activity level, location has disabled the activity levels.', 422)
    }
}
