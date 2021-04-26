/**
 * @category Services
 * @module Ws
 */
import WebSocket from 'ws'
import Server from '@ioc:Adonis/Core/Server'
import { ActivityLevels } from 'app/Utils/Activity'

/**
 * @enum WebSocketDataTypes
 */
export enum WebSocketDataTypes {
    Connected,
    Activity,
}

/**
 * @interface WebSocketClient
 * @extends WebSocket
 */
export interface WebSocketClient extends WebSocket {
    isAlive: boolean
}

/**
 * @interface WebSocketData
 */
export interface WebSocketData {
    type: WebSocketDataTypes
    data?: any
}

/**
 * @class Ws
 */
class Ws {
    public isReady = false
    public server: WebSocket.Server

    public start(callback: (ws: WebSocketClient) => void) {
        this.server = new WebSocket.Server({
            server: Server.instance!,
            // Track connected clients in "server.clients"
            clientTracking: true,
        })

        this.server.on('connection', callback)
        this.isReady = true
    }

    protected broadcast(data: WebSocketData) {
        const serializedData = JSON.stringify(data)

        this.server.clients.forEach((client: WebSocketClient) => {
            client.send(serializedData)
        })
    }

    public broadcastActivity(oid: number, locationId: number, activityLevel: ActivityLevels) {
        this.broadcast({
            type: WebSocketDataTypes.Activity,
            data: {
                oid,
                location_id: locationId,
                activity_level: activityLevel,
            },
        })
    }

    // Helper function for serializing data before sending it
    public send(ws: WebSocketClient, data: WebSocketData) {
        ws.send(JSON.stringify(data))
    }
}

/**
 * This makes our service a singleton
 */
export default new Ws()
