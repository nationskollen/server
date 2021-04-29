/**
 * The registered middlewares are placed in this file
 *
 * @category Misc
 * @module Kernel
 */

/*
|--------------------------------------------------------------------------
| Application middleware
|--------------------------------------------------------------------------
|
| This file is used to define middleware for HTTP requests. You can register
| middleware as a `closure` or an IoC container binding. The bindings are
| preferred, since they keep this file clean.
|
*/

import Server from '@ioc:Adonis/Core/Server'

/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
|
| An array of global middleware, that will be executed in the order they
| are defined for every HTTP requests.
|
*/
Server.middleware.register(['Adonis/Core/BodyParserMiddleware'])

/*
|--------------------------------------------------------------------------
| Named middleware
|--------------------------------------------------------------------------
|
| Named middleware are defined as key-value pair. The value is the namespace
| or middleware function and key is the alias. Later you can use these
| alias on individual routes. For example:
|
| { auth: 'App/Middleware/Auth' }
|
| and then use it as follows
|
| Route.get('dashboard', 'UserController.dashboard').middleware('auth')
|
*/
Server.middleware.registerNamed({
    // Authentication
    auth: 'App/Middleware/Auth',
    scope: 'App/Middleware/Scope',

    // Resources
    menu: 'App/Middleware/Menu',
    nation: 'App/Middleware/Nation',
    menuItem: 'App/Middleware/MenuItem',
    location: 'App/Middleware/Location',
    openingHour: 'App/Middleware/OpeningHour',
    event: 'App/Middleware/Event',
    subscription: 'App/Middleware/Subscription',
    notification: 'App/Middleware/Notification',
})
