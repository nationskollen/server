import DefaultException from 'App/Exceptions/DefaultException'

export default class NationNotFoundException extends DefaultException {
    constructor() {
        super('Could not find opening hour', 404)
    }
}
