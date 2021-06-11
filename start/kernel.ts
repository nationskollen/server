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
Server.middleware.register([() => import('@ioc:Adonis/Core/BodyParser')])

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
    auth: () => import('App/Middleware/Auth'),
    scope: () => import('App/Middleware/Scope'),
    permission: () => import('App/Middleware/Permission'),

    // Resources
    user: () => import('App/Middleware/User'),
    nation: () => import('App/Middleware/Nation'),
    individual: () => import('App/Middleware/Individual'),
    contact: () => import('App/Middleware/Contact'),
    news: () => import('App/Middleware/News'),

    menu: () => import('App/Middleware/Menu'),
    menuItem: () => import('App/Middleware/MenuItem'),

    location: () => import('App/Middleware/Location'),
    openingHour: () => import('App/Middleware/OpeningHour'),
    event: () => import('App/Middleware/Event'),

    subscription: () => import('App/Middleware/Subscription'),
    notification: () => import('App/Middleware/Notification'),
})
