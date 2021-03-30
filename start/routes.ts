import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'


Route.group(() => {
    Route.get('/health', async ({ response }) => {
        const report = await HealthCheck.getReport()
        return report.healthy ? response.ok(report) : response.badRequest(report)
    })

    Route.post('/user/login', 'AuthController.login')

    Route.get('/nations', 'NationsController.index')
    Route.get('/nations/:id', 'NationsController.show').middleware('nation')
    Route.put('/nations/:id', 'NationsController.update').middleware(['auth', 'nation'])
}).prefix('/api/v1')
