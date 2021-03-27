import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

interface HealthReport {
    health: {
        healthy: boolean
    }
}

test.group('Health', () => {
    test('assert health report', async (assert) => {
        const { text } = await supertest(BASE_URL).get('/health').expect(200)
        const data = JSON.parse(text)

        assert.isTrue(data.healthy)

        for (const item of Object.values(data.report)) {
            const report = item as HealthReport
            assert.isTrue(report.health.healthy)
        }
    })
})
