/**
 * @category Misc
 * @module Socket
 */
import Ws, { WebSocketClient, WebSocketDataTypes } from 'App/Services/Ws'

function onConnection(ws: WebSocketClient) {
    // Mark websocket as alive
    ws.isAlive = true

    // Send verification of connection status
    Ws.send(ws, { type: WebSocketDataTypes.Connected })
}

// Start WebSocket server
Ws.start(onConnection)
