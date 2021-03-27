import Ws from 'App/Services/Ws'

Ws.start((socket) => {
    socket.emit('start', { hello: 'from server' })

    socket.on('test', (data) => {
        console.log(data)
    })
})
