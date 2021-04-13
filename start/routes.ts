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
    Route.post('/users/login', 'AuthController.login')

    // ----------------------------------------------------------
    // Nations
    // ----------------------------------------------------------
    Route.get('/nations', 'NationsController.index')

    // ----------------------------------------------------------
    // Single nation
    // ----------------------------------------------------------
    Route.get('/nations/:id', 'NationsController.show').middleware(['nation:preload'])
    Route.put('/nations/:id', 'NationsController.update').middleware([
        'auth',
        'nation:preload',
        'scope:admin',
    ])
    Route.post('/nations/:id/upload', 'NationsController.upload').middleware([
        'auth',
        'nation',
        'scope:admin',
    ])

    // ----------------------------------------------------------
    // Locations
    // ----------------------------------------------------------
    Route.get('/nations/:id/locations', 'LocationsController.index').middleware(['nation'])
    Route.post('/nations/:id/locations', 'LocationsController.create').middleware([
        'auth',
        'nation',
        'scope:admin',
    ])

    // ----------------------------------------------------------
    // Single location
    // ----------------------------------------------------------
    Route.get('/nations/:id/locations/:lid', 'LocationsController.single').middleware([
        'nation',
        'location:preload',
    ])
    Route.put('/nations/:id/locations/:lid', 'LocationsController.update').middleware([
        'auth',
        'nation',
        'location',
        'scope:admin',
    ])
    Route.delete('/nations/:id/locations/:lid', 'LocationsController.delete').middleware([
        'auth',
        'nation',
        'location',
        'scope:admin',
    ])

    // ----------------------------------------------------------
    // Location actions
    // ----------------------------------------------------------
    Route.put('/locations/:lid/open', 'LocationsController.open').middleware([
        'auth',
        'location',
        'scope:staff',
    ])
    Route.put('/locations/:lid/close', 'LocationsController.close').middleware([
        'auth',
        'location',
        'scope:staff',
    ])
    Route.put('/locations/:lid/activity', 'LocationsController.activity').middleware([
        'auth',
        'location',
        'scope:staff',
    ])
    Route.post('/locations/:lid/upload', 'LocationsController.upload').middleware([
        'auth',
        'location',
        'scope:admin',
    ])

    // ----------------------------------------------------------
    // Location opening hours
    // ----------------------------------------------------------
    Route.get('/locations/:lid/hours', 'OpeningHoursController.index').middleware(['location'])
    Route.get('/locations/:lid/hours/:hid', 'OpeningHoursController.single').middleware([
        'location',
        'openingHour:preload',
    ])
    Route.post('/locations/:lid/hours', 'OpeningHoursController.create').middleware([
        'auth',
        'location',
        'scope:admin',
    ])
    Route.put('/locations/:lid/hours/:hid', 'OpeningHoursController.update').middleware([
        'auth',
        'location',
        'openingHour',
        'scope:admin',
    ])
    Route.delete('/locations/:lid/hours/:hid', 'OpeningHoursController.delete').middleware([
        'auth',
        'location',
        'openingHour',
        'scope:admin',
    ])

    // ----------------------------------------------------------
    // Location menus
    // ----------------------------------------------------------
    Route.get('/locations/:lid/menus', 'MenusController.index').middleware(['location'])
    Route.get('/locations/:lid/menus/:mid', 'MenusController.single').middleware([
        'location',
        'menu:preload',
    ])
    Route.post('/locations/:lid/menus', 'MenusController.create').middleware([
        'auth',
        'location',
        'scope:admin',
    ])
    Route.put('/locations/:lid/menus/:mid', 'MenusController.update').middleware([
        'auth',
        'location',
        'menu',
        'scope:admin',
    ])
    Route.delete('/locations/:lid/menus/:mid', 'MenusController.delete').middleware([
        'auth',
        'location',
        'menu',
        'scope:admin',
    ])

    // ----------------------------------------------------------
    // Location menu items
    // ----------------------------------------------------------
    Route.get('/menus/:mid/items', 'MenuItemsController.index').middleware(['menu'])
    Route.post('/menus/:mid/items', 'MenuItemsController.create').middleware([
        'auth',
        'menu',
        'scope:admin',
    ])
    Route.get('/menus/:mid/items/:miid', 'MenuItemsController.single').middleware([
        'menu',
        'menuItem',
    ])
    Route.put('/menus/:mid/items/:miid', 'MenuItemsController.update').middleware([
        'auth',
        'menu',
        'menuItem',
        'scope:admin',
    ])
    Route.delete('/menus/:mid/items/:miid', 'MenuItemsController.delete').middleware([
        'auth',
        'menu',
        'menuItem',
        'scope:admin',
    ])
    Route.post('/menus/:mid/items/:miid/upload', 'MenuItemsController.upload').middleware([
        'auth',
        'menu',
        'menuItem',
        'scope:admin',
    ])

    // ----------------------------------------------------------
    // Event
    // ----------------------------------------------------------
    //TODO Set routes for different queries
    Route.get('/nations/:id/events', 'EventsController.index').middleware([
        'nation','event'])
    Route.post('/nations/:id/events', 'EventsController.create').middleware([
        'auth',
        'nation',
        'scope:admin',
    ])
    Route.get('/nations/:id/events/:eid', 'EventsController.single').middleware(['nation',
                                                                                'event'])
    Route.put('/nations/:id/events/:eid', 'EventsController.update').middleware([
        'auth',
        'nation',
        'event',
        'scope:admin',
    ])
    Route.delete('/nations/:id/events/:eid', 'EventsController.delete').middleware([
        'auth',
        'nation',
        'event',
        'scope:admin',
    ])
    Route.post('/nations/:id/events/:eid/upload', 'EventsController.upload').middleware([
        'auth',
        'nation',
        'event',
        'scope:admin',
    ])
}).prefix('/api/v1')

