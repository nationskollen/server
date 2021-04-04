import test from 'japa'
import wstest from 'superwstest'
import supertest from 'supertest'
import { BASE_URL, HOSTNAME } from 'App/Utils/Constants'
import { WebSocketDataTypes } from 'App/Services/Ws'

interface HealthReport {
    health: {
        healthy: boolean
    }
}

test.group('Health', () => {
    test('ensure system health', async (assert) => {
        const { text } = await supertest(BASE_URL).get('/health').expect(200)
        const data = JSON.parse(text)

        assert.isTrue(data.healthy)

        for (const item of Object.values(data.report)) {
            const report = item as HealthReport
            assert.isTrue(report.health.healthy)
        }
    })

    test('ensure websocket server is running', async () => {
        await wstest(HOSTNAME)
            .ws('/')
            .expectJson({ type: WebSocketDataTypes.Connected })
            .close();
    })
})
