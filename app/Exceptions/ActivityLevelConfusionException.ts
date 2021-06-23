/**
 * @category Exceptions
 * @module ActivityLevelConfusionException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class ActivityLevelConfusionException extends DefaultException {
    constructor() {
        super('Unable to update activity level, only a single field allowed when changing activity level', 422)
    }
}
