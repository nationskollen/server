/**
 * The NewsController contains the different methods that gives the ability
 * to operate upon {@link News | News} models.
 *
 * @category Controller
 * @module NewsController
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getNews, getNation, getValidatedData } from 'App/Utils/Request'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import { Permissions } from 'App/Utils/Permissions'
import NewsCreateValidator from 'App/Validators/News/CreateValidator'
import NewsUpdateValidator from 'App/Validators/News/UpdateValidator'
import NewsFilterValidator from 'App/Validators/News/FilterValidator'
import NewsUploadValidator from 'App/Validators/News/UploadValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'
import { getPageNumber } from 'App/Utils/Paginate'
import News from 'App/Models/News'
import FilteringOptions from 'App/Utils/FilteringOptions'

export default class NewsController extends FilteringOptions {
    /**
     * Method to retrieve all the news and messages in the system
     * for a given nation.
     * The actual function call is done by a request (CRUD) which are specified
     * in `Routes.ts`
     */
    public async all({ request }: HttpContextContract) {
        const { exclude_oids, date, before, after } = await getValidatedData(
            request,
            NewsFilterValidator,
            true
        )
        const specified = await getValidatedData(request, PaginationValidator, true)

        const query = News.query().apply((scopes) => {
            this.applyFilters(scopes, { date, before, after })
            this.applyExclusionOids(scopes, exclude_oids)
        })

        const news = await query.paginate(getPageNumber(specified.page), specified.amount)
        return news.toJSON()
    }

    /**
     * fetch news for a nation in the system
     */
    public async index({ request }: HttpContextContract) {
        const { oid } = getNation(request)
        const { date, before, after } = await getValidatedData(request, NewsFilterValidator, true)
        const specified = await getValidatedData(request, PaginationValidator, true)

        const query = News.query()
            .where('nation_id', oid)
            .apply((scopes) => {
                this.applyFilters(scopes, { date, before, after })
            })

        const news = await query.paginate(getPageNumber(specified.page), specified.amount)
        return news.toJSON()
    }

    /**
     * Method to retrieve a single news in the system
     */
    public async single({ request }: HttpContextContract) {
        return getNews(request).toJSON()
    }

    /**
     * Create a news model for a nation specified in the route
     */
    public async create({ bouncer, request }: HttpContextContract) {
        const nation = getNation(request)

        await bouncer.authorize('permissions', Permissions.News, nation.oid)

        const data = await getValidatedData(request, NewsCreateValidator)
        const newsObject = await nation.related('news').create(data)

        // Create notification related to the news message created above
        await newsObject.createNotification()

        return newsObject.toJSON()
    }

    /**
     * Update a news model in a nation
     */
    public async update({ bouncer, request }: HttpContextContract) {
        const news = getNews(request)

        await bouncer.authorize('permissions', Permissions.News, news.nationId)

        const changes = await getValidatedData(request, NewsUpdateValidator)

        news.merge(changes)
        await news.save()

        return news.toJSON()
    }

    /**
     * Delete a news model in a nation
     */
    public async delete({ bouncer, request }: HttpContextContract) {
        const news = getNews(request)

        await bouncer.authorize('permissions', Permissions.News, news.nationId)

        await news.delete()
    }

    /**
     * Method to upload an image to news in the system
     */
    public async upload({ bouncer, request }: HttpContextContract) {
        const news = getNews(request)

        await bouncer.authorize('permissions', Permissions.News, news.nationId)

        const { cover } = await getValidatedData(request, NewsUploadValidator)
        const coverName = await attemptFileUpload(cover)

        if (coverName) {
            attemptFileRemoval(news.coverImgSrc)
            news.coverImgSrc = coverName
        }

        // Update cover image
        await news.save()

        return news.toJSON()
    }
}
