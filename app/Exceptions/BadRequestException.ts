import DefaultException from 'App/Exceptions/DefaultException'

export default class BadRequestException extends DefaultException {
    constructor(message: string) {
        super(message, 400)
    }
}
