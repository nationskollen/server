import DefaultException from 'App/Exceptions/DefaultException'

export default class EventNotFoundException extends DefaultException {
    constructor() {
        super('Could not find event', 404)
    }
}
