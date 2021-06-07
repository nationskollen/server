/**
 * The NewsController contains the different methods that gives the ability
 * to operate upon {@link News | News} models.
 *
 * @category Controller
 * @module NewsController
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getNewsObject, getNation, getValidatedData } from 'App/Utils/Request'
import { attemptFileUpload, attemptFileRemoval } from 'App/Utils/Upload'
import NewsCreateValidator from 'App/Validators/News/CreateValidator'
import NewsUpdateValidator from 'App/Validators/News/UpdateValidator'
import NewsFilterValidator from 'App/Validators/News/FilterValidator'
import NewsUploadValidator from 'App/Validators/News/UploadValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'
import { getPageNumber } from 'App/Utils/Paginate'
import { ExtractScopes } from '@ioc:Adonis/Lucid/Model'
import News from 'App/Models/News'
import { DateTime } from 'luxon'

export default class NewsController {
    /**
     * Method that applies given filters depedning on what type of event to
     * filter after
     * @param scopes - The different scopes that exists in the system
     * @param filters - The filter to apply
     */
    private applyFilters(
        scopes: ExtractScopes<typeof News>,
        filters: Record<string, DateTime | undefined>
    ) {
        if (filters.date) {
            // Filter based on selected date
            scopes.onDate(filters.date)
        } else {
            if (filters.before) {
                // Filter based on when the news were produced at a certain date
                scopes.beforeDate(filters.before)
            }

            if (filters.after) {
                // Filter based on after the news were produced at a certain date
                scopes.afterDate(filters.after)
            }
        }

        // Order news based on the 'created_at' field
        scopes.inOrder()
    }

    /**
     * Method to retrieve all the news and messages in the system
     * for a given nation.
     * The actual function call is done by a request (CRUD) which are specified
     * in `Routes.ts`
     */
    public async all({ request }: HttpContextContract) {
        const { date, before, after } = await getValidatedData(request, NewsFilterValidator, true)
        const specified = await getValidatedData(request, PaginationValidator, true)

        const query = News.query().apply((scopes) => {
            this.applyFilters(scopes, { date, before, after })
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
        return getNewsObject(request).toJSON()
    }

    /**
     * Create a news model for a nation specified in the route
     */
    public async create({ request }: HttpContextContract) {
        const nation = getNation(request)
        const data = await getValidatedData(request, NewsCreateValidator)
        const newsObject = await nation.related('news').create(data)

        // Create notification related to the news message created above
        await newsObject.createNotification()

        return newsObject.toJSON()
    }

    /**
     * Update a news model in a nation
     */
    public async update({ request }: HttpContextContract) {
        const newsObject = getNewsObject(request)
        const changes = await getValidatedData(request, NewsUpdateValidator)

        newsObject.merge(changes)
        await newsObject.save()

        return newsObject.toJSON()
    }

    /**
     * Delete a contacts model in a nation
     */
    public async delete({ request }: HttpContextContract) {
        const news = getNewsObject(request)
        await news.delete()
    }

    /**
     * Method to upload an image to news in the system
     */
    public async upload({ request }: HttpContextContract) {
        const news = getNewsObject(request)
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
