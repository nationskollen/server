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
    Route.put('/nations/:id', 'NationsController.update').middleware(['auth', 'nation:admin'])
    Route.put('/nations/:id/open', 'NationsController.open').middleware(['auth', 'nation:staff'])
    Route.put('/nations/:id/close', 'NationsController.close').middleware(['auth', 'nation:staff'])
    Route.put('/nations/:id/activity', 'NationsController.updateActivity').middleware([
        'auth',
        'nation:staff',
    ])

    Route.group(() => {
        Route.post('/', 'OpeningHoursController.create')
        Route.put('/:ohid', 'OpeningHoursController.update').middleware(['opening_hour'])
        Route.delete('/:ohid', 'OpeningHoursController.delete').middleware(['opening_hour'])
    })
        .prefix('/nations/:id/opening_hours')
        .middleware(['auth', 'nation:admin'])
}).prefix('/api/v1')
