import DefaultException from 'App/Exceptions/DefaultException'

export default class EventNotApplicableException extends DefaultException {
    constructor() {
        super(
            'Could either not find location, or the location is not part of the specifed nation',
            404
        )
    }
}
