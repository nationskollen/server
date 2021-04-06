import DefaultException from 'App/Exceptions/DefaultException'

export default class LocationNotFoundException extends DefaultException {
    constructor() {
        super('Could not find location', 404)
    }
}
