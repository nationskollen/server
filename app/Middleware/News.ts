/**
 * News middleware handles valid request made to the server and informs the
 * requester if something is invalid.
 *
 * Depending on what was invalid, an exception will be thrown.
 *
 * Exceptions in this middleware are:
 *
 * - `NewsNotFoundException`
 *
 * @category Middleware
 * @module NewsMiddleware
 *
 */
import News from 'App/Models/News'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NewsNotFoundException from 'App/Exceptions/NewsNotFoundException'

export default class NewsMiddleware {
    /**
     * Handle request
     */
    public async handle({ request, params }: HttpContextContract, next: () => Promise<void>) {
        const news = await News.find(params.nid)

        if (!news) {
            throw new NewsNotFoundException()
        }

        request.news = news

        await next()
    }
}
