import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'

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
})
