/**
 * Here are all the routes specified that can be used for the different `CRUD`
 * operations on the models.
 *
 * In short; A route is often protected using a {@category Middleware |
 * middleware} that authenticates the request and makes sure the operation that
 * is requested is performed correctly.
 *
 * The routes have the characteristics like for e.g:
 * ```json
 * GET /api/v1/nations/400/locations/1
 * ```
 *
 * Documentation aobut the CRUD operations and how the different paths look
 * like can be found in the `insomnia` documenation.
 *
 * @category Misc
 * @module Route
 */
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
    Route.post('/users/logout', 'AuthController.logout').middleware(['auth'])

    // ----------------------------------------------------------
    // Nations
    // ----------------------------------------------------------
    Route.get('/nations', 'NationsController.index')

    // ----------------------------------------------------------
    // Single nation
    // ----------------------------------------------------------
    Route.get('/nations/:id', 'NationsController.single').middleware(['nation:preloadDefault'])
    Route.put('/nations/:id', 'NationsController.update').middleware([
        'auth',
        'nation:preloadDefault',
        'scope:admin',
    ])
    Route.post('/nations/:id/upload', 'NationsController.upload').middleware([
        'auth',
        'nation:preloadDefault',
        'scope:admin',
    ])
    // ----------------------------------------------------------
    // individuals
    // ----------------------------------------------------------
    Route.get('/individuals', 'IndividualsController.index')

    // ----------------------------------------------------------
    // Single individual
    // ----------------------------------------------------------
    Route.get('/individuals/:iid', 'IndividualsController.single').middleware([
        'auth',
        'individual',
        'scope:admin',
    ])
    Route.post('/nations/:id/individuals', 'IndividualsController.create').middleware([
        'auth',
        'nation',
        'scope:admin',
    ])
    Route.put('/individuals/:iid', 'IndividualsController.update').middleware([
        'auth',
        'individual',
        'scope:admin',
    ])
    Route.post('/individuals/:iid/upload', 'IndividualsController.upload').middleware([
        'auth',
        'individual',
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
    // Updating locations
    // ----------------------------------------------------------
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
    Route.get('/locations/:lid', 'LocationsController.single').middleware(['location:preload'])
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
    Route.get('/hours/:hid', 'OpeningHoursController.single').middleware(['openingHour:preload'])
    Route.get('/locations/:lid/hours', 'OpeningHoursController.index').middleware(['location'])
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
    Route.get('/menus/:mid', 'MenusController.single').middleware(['menu'])
    Route.get('/locations/:lid/menus', 'MenusController.index').middleware(['location'])
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
    Route.post('/menus/:mid/upload', 'MenusController.upload').middleware([
        'auth',
        'menu',
        'scope:admin',
    ])

    // ----------------------------------------------------------
    // Location menu items
    // ----------------------------------------------------------
    Route.get('/items/:miid', 'MenuItemsController.single').middleware(['menuItem'])
    Route.get('/menus/:mid/items', 'MenuItemsController.index').middleware(['menu'])
    Route.post('/menus/:mid/items', 'MenuItemsController.create').middleware([
        'auth',
        'menu',
        'scope:admin',
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
    Route.get('/events', 'EventsController.all')
    Route.get('/events/:eid', 'EventsController.single').middleware(['event:preload'])
    Route.get('/events/:eid/description', 'EventsController.description').middleware(['event'])
    Route.get('/nations/:id/events', 'EventsController.index').middleware(['nation'])
    Route.post('/nations/:id/events', 'EventsController.create').middleware([
        'auth',
        'nation',
        'scope:admin',
    ])
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
    Route.post('/events/:eid/upload', 'EventsController.upload').middleware([
        'auth',
        'event',
        'scope:admin',
    ])

    // ----------------------------------------------------------
    // categories
    // ----------------------------------------------------------
    Route.get('/categories', 'CategoriesController.index')
}).prefix('/api/v1')
