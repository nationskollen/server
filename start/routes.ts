import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'

Route.group(() => {
    // ----------------------------------------------------------
    // System health
    // ----------------------------------------------------------
    Route.get('/health', async ({ response }) => {
        const report = await HealthCheck.getReport()
        return report.healthy ? response.ok(report) : response.badRequest(report)
    })

    // ----------------------------------------------------------
    // Authentication
    // ----------------------------------------------------------
    Route.post('/user/login', 'AuthController.login')

    // ----------------------------------------------------------
    // Nations
    // ----------------------------------------------------------
    Route.get('/nations', 'NationsController.index')

    // ----------------------------------------------------------
    // Single nation
    // ----------------------------------------------------------
    Route.get('/nations/:id', 'NationsController.show').middleware(['nation'])
    Route.put('/nations/:id', 'NationsController.update').middleware(['auth', 'nation:admin'])

    // ----------------------------------------------------------
    // Locations
    // ----------------------------------------------------------
    Route.get('/nations/:id/locations', 'LocationsController.index').middleware(['nation'])
    Route.post('/nations/:id/locations', 'LocationsController.create').middleware([
        'auth',
        'nation:admin',
    ])

    // ----------------------------------------------------------
    // Single location
    // ----------------------------------------------------------
    Route.get('/nations/:id/locations/:lid', 'LocationsController.single').middleware([
        'nation',
        'location',
    ])
    Route.put('/nations/:id/locations/:lid', 'LocationsController.update').middleware([
        'auth',
        'nation:admin',
        'location',
    ])
    Route.delete('/nations/:id/locations/:lid', 'LocationsController.delete').middleware([
        'auth',
        'nation:admin',
        'location',
    ])

    // ----------------------------------------------------------
    // Single location actions (e.g. open/close/activity)
    // ----------------------------------------------------------
    Route.put('/nations/:id/locations/:lid/open', 'LocationsController.open').middleware([
        'auth',
        'nation:staff',
        'location',
    ])
    Route.put('/nations/:id/locations/:lid/close', 'LocationsController.close').middleware([
        'auth',
        'nation:staff',
        'location',
    ])
    Route.put('/nations/:id/locations/:lid/activity', 'LocationsController.activity').middleware([
        'auth',
        'nation:staff',
        'location',
    ])

    // ----------------------------------------------------------
    // Single location opening hours
    // ----------------------------------------------------------
    Route.post('/nations/:id/locations/:lid/hours', 'OpeningHoursController.create').middleware([
        'auth',
        'nation:admin',
        'location',
    ])
    Route.put(
        '/nations/:id/locations/:lid/hours/:hid',
        'OpeningHoursController.update'
    ).middleware(['auth', 'nation:admin', 'location', 'openinghour'])
    Route.delete(
        '/nations/:id/locations/:lid/hours/:hid',
        'OpeningHoursController.delete'
    ).middleware(['auth', 'nation:admin', 'location', 'openinghour'])
}).prefix('/api/v1')
