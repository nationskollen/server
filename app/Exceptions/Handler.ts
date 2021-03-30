/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import { Exception } from '@poppinss/utils'
import Logger from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
    constructor() {
        super(Logger)
    }

    public async report(error: Exception, ctx: HttpContextContract) {
        // Ignore all logging in tests. The test cases and their asserts is
        // more interesting than exceptions that has been thrown.
        if (process.env.NODE_ENV === 'testing') {
            return
        }

        super.report(error, ctx)
    }
}
