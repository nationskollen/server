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
    // Authentication / User
    // ----------------------------------------------------------
    Route.post('/users/login', 'AuthController.login')
    Route.post('/users/logout', 'AuthController.logout').middleware(['auth'])
    Route.get('/nations/:id/users', 'UsersController.index').middleware(['auth', 'nation'])

    Route.get('/users/:uid', 'UsersController.single').middleware(['auth', 'user:permissions'])
    Route.post('/nations/:id/users', 'UsersController.create').middleware(['auth', 'nation'])
    Route.put('/users/:uid', 'UsersController.update').middleware(['auth', 'user', 'scope:admin'])
    Route.post('/users/:uid/upload', 'UsersController.upload').middleware(['auth', 'user'])
    Route.delete('/users/:uid', 'UsersController.delete').middleware(['auth', 'user'])

    // ----------------------------------------------------------
    // Permission(s)
    // ----------------------------------------------------------
    Route.get('/permissions', 'PermissionsController.index')
    Route.post('/permissions', 'PermissionsController.add').middleware(['auth', 'permission'])

    Route.delete('/permissions', 'PermissionsController.remove').middleware([
        'auth',
        'permission:delete',
    ])

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
    ])
    Route.post('/nations/:id/upload', 'NationsController.upload').middleware([
        'auth',
        'nation:preloadDefault',
    ])

    // ----------------------------------------------------------
    // contact information - nation
    // ----------------------------------------------------------
    Route.get('/nations/:id/contact', 'ContactsController.index').middleware(['nation'])
    Route.post('/nations/:id/contact', 'ContactsController.create').middleware(['auth', 'nation'])
    Route.put('/nations/:id/contact/:cid', 'ContactsController.update').middleware([
        'auth',
        'nation',
        'contact',
    ])
    Route.delete('/nations/:id/contact/:cid', 'ContactsController.delete').middleware([
        'auth',
        'nation',
        'contact',
    ])

    // ----------------------------------------------------------
    // news
    // ----------------------------------------------------------
    Route.get('/news', 'NewsController.all')
    Route.get('/news/:nid', 'NewsController.single').middleware(['news'])
    Route.get('/nations/:id/news', 'NewsController.index').middleware(['nation'])
    Route.post('/nations/:id/news', 'NewsController.create').middleware(['auth', 'nation'])
    Route.put('/nations/:id/news/:nid', 'NewsController.update').middleware([
        'auth',
        'nation',
        'news',
    ])
    Route.delete('/nations/:id/news/:nid', 'NewsController.delete').middleware([
        'auth',
        'nation',
        'news',
    ])
    Route.post('/news/:nid/upload', 'NewsController.upload').middleware(['auth', 'news'])

    // ----------------------------------------------------------
    // Individuals
    // ----------------------------------------------------------
    Route.get('/nations/:id/individuals', 'IndividualsController.index').middleware(['nation'])
    Route.post('/nations/:id/individuals', 'IndividualsController.create').middleware([
        'auth',
        'nation',
    ])

    // ----------------------------------------------------------
    // Single individual
    // ----------------------------------------------------------
    Route.get('/individuals/:iid', 'IndividualsController.single').middleware(['individual'])
    Route.post('/individuals/:iid/upload', 'IndividualsController.upload').middleware([
        'auth',
        'individual',
    ])
    Route.put('/nations/:id/individuals/:iid', 'IndividualsController.update').middleware([
        'auth',
        'nation',
        'individual',
    ])
    Route.delete('/nations/:id/individuals/:iid', 'IndividualsController.delete').middleware([
        'auth',
        'nation',
        'individual',
    ])

    // ----------------------------------------------------------
    // Locations
    // ----------------------------------------------------------
    Route.get('/nations/:id/locations', 'LocationsController.index').middleware(['nation'])
    Route.post('/nations/:id/locations', 'LocationsController.create').middleware([
        'auth',
        'nation',
    ])

    // ----------------------------------------------------------
    // Updating locations
    // ----------------------------------------------------------
    Route.put('/nations/:id/locations/:lid', 'LocationsController.update').middleware([
        'auth',
        'nation',
        'location',
    ])
    Route.delete('/nations/:id/locations/:lid', 'LocationsController.delete').middleware([
        'auth',
        'nation',
        'location',
    ])

    // ----------------------------------------------------------
    // Location actions
    // ----------------------------------------------------------
    Route.get('/locations/:lid', 'LocationsController.single').middleware(['location:preload'])
    Route.put('/locations/:lid/open', 'LocationsController.open').middleware(['auth', 'location'])
    Route.put('/locations/:lid/close', 'LocationsController.close').middleware(['auth', 'location'])
    Route.put('/locations/:lid/activity', 'LocationsController.activity').middleware([
        'auth',
        'location',
    ])
    Route.post('/locations/:lid/upload', 'LocationsController.upload').middleware([
        'auth',
        'location',
    ])

    // ----------------------------------------------------------
    // Location opening hours
    // ----------------------------------------------------------
    Route.get('/hours/:hid', 'OpeningHoursController.single').middleware(['openingHour:preload'])
    Route.get('/locations/:lid/hours', 'OpeningHoursController.index').middleware(['location'])
    Route.post('/locations/:lid/hours', 'OpeningHoursController.create').middleware([
        'auth',
        'location',
    ])
    Route.put('/locations/:lid/hours/:hid', 'OpeningHoursController.update').middleware([
        'auth',
        'location',
        'openingHour',
    ])
    Route.delete('/locations/:lid/hours/:hid', 'OpeningHoursController.delete').middleware([
        'auth',
        'location',
        'openingHour',
    ])

    // ----------------------------------------------------------
    // Location menus
    // ----------------------------------------------------------
    Route.get('/menus/:mid', 'MenusController.single').middleware(['menu'])
    Route.get('/locations/:lid/menus', 'MenusController.index').middleware(['location'])
    Route.post('/locations/:lid/menus', 'MenusController.create').middleware(['auth', 'location'])
    Route.put('/locations/:lid/menus/:mid', 'MenusController.update').middleware([
        'auth',
        'location',
        'menu',
    ])
    Route.delete('/locations/:lid/menus/:mid', 'MenusController.delete').middleware([
        'auth',
        'location',
        'menu',
    ])
    Route.post('/menus/:mid/upload', 'MenusController.upload').middleware(['auth', 'menu'])

    // ----------------------------------------------------------
    // Location menu items
    // ----------------------------------------------------------
    Route.get('/items/:miid', 'MenuItemsController.single').middleware(['menuItem'])
    Route.get('/menus/:mid/items', 'MenuItemsController.index').middleware(['menu'])
    Route.post('/menus/:mid/items', 'MenuItemsController.create').middleware(['auth', 'menu'])
    Route.put('/menus/:mid/items/:miid', 'MenuItemsController.update').middleware([
        'auth',
        'menu',
        'menuItem',
    ])
    Route.delete('/menus/:mid/items/:miid', 'MenuItemsController.delete').middleware([
        'auth',
        'menu',
        'menuItem',
    ])
    Route.post('/menus/:mid/items/:miid/upload', 'MenuItemsController.upload').middleware([
        'auth',
        'menu',
        'menuItem',
    ])

    // ----------------------------------------------------------
    // Event
    // ----------------------------------------------------------
    Route.get('/events', 'EventsController.all')
    Route.get('/events/:eid', 'EventsController.single').middleware(['event:preload'])
    Route.get('/events/:eid/description', 'EventsController.description').middleware(['event'])
    Route.get('/nations/:id/events', 'EventsController.index').middleware(['nation'])
    Route.post('/nations/:id/events', 'EventsController.create').middleware(['auth', 'nation'])
    Route.put('/nations/:id/events/:eid', 'EventsController.update').middleware([
        'auth',
        'nation',
        'event',
    ])
    Route.delete('/nations/:id/events/:eid', 'EventsController.delete').middleware([
        'auth',
        'nation',
        'event',
    ])
    Route.post('/events/:eid/upload', 'EventsController.upload').middleware(['auth', 'event'])

    // ----------------------------------------------------------
    // Subscriptions
    // ----------------------------------------------------------
    Route.get('/subscriptions/topics', 'SubscriptionsController.topics')
    Route.get('/subscriptions', 'SubscriptionsController.all')
    Route.post('/subscriptions', 'SubscriptionsController.create')
    Route.delete('/subscriptions/:uuid', 'SubscriptionsController.delete').middleware([
        'subscription',
    ])

    // ----------------------------------------------------------
    // Notifications
    // ----------------------------------------------------------
    Route.get('/notifications', 'NotificationsController.all')
    Route.get('/notifications/:nid', 'NotificationsController.index').middleware(['notification'])

    // ----------------------------------------------------------
    // Categories
    // ----------------------------------------------------------
    Route.get('/categories', 'CategoriesController.index')
}).prefix('/api/v1')
