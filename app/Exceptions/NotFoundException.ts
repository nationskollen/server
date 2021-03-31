import DefaultException from 'App/Exceptions/DefaultException'

export default class NotFoundException extends DefaultException {
    constructor(message: string) {
        super(message, 404)
    }
}
