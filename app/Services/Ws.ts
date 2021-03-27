import socketIo from 'socket.io'
import Server from '@ioc:Adonis/Core/Server'

class Ws {
    public isReady = false
    public io: socketIo.Server

    public start(callback: (socket: socketIo.Socket) => void) {
        this.io = new socketIo.Server(Server.instance!, {
            // CORS (Cross-origin resource sharing) must be disabled
            // to allow for users of the mobile app to connect. The
            // app does not have the same origin of the API and will
            // be blocked unless it is disabled.
            // [CORS configuration]{@link https://socket.io/docs/v4/handling-cors/#Configuration}
            cors: {
                origin: '*',
            },
        })
        this.io.on('connection', callback)
        this.isReady = true
    }
}

// This makes our service a singleton
export default new Ws()
