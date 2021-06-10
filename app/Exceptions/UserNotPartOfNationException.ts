/**
 * @category Exceptions
 * @module UserNotPartOfNationException
 */
import DefaultException from 'App/Exceptions/DefaultException'

export default class UserNotPartOfNationException extends DefaultException {
    constructor() {
        super(
            'Specified user is not part of your nation. Please control that the choosen user is part of your nation.',
            401
        )
    }
}
