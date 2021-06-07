/**
 * This file contains all the ordering options that can be operated onto models that extends the `OrderableModel` class.
 * The following models extend it:
 *
 * - {@link Event | Event}.
 * - {@link News | News}.
 *
 * @category Utils
 * @module OrderableModel
 */

import { DateTime } from 'luxon'
import { BaseModel, scope } from '@ioc:Adonis/Lucid/Orm'

export default class OrderableModel extends BaseModel {
    /**
     * Ordering options to query at descending order
     */
    public static inOrder = scope((query) => {
        query.orderBy('created_at', 'desc')
    })

    /**
     * Filtering options to query before specified date
     */
    public static beforeDate = scope((query, date: DateTime) => {
        query.where('occurs_at', '<', date.toISO())
    })

    /**
     * Filtering options to query after specified date
     */
    public static afterDate = scope((query, date: DateTime) => {
        /**
         * NOTE: Simply filtering by '>' with 'date.toISO()' does not work.
         * No idea why this is, but I don't really care either.
         */
        query.where('occurs_at', '>=', date.plus({ day: 1 }).toISO())
    })

    /**
     * Filtering options to query at specified date
     */
    public static onDate = scope((query, date: DateTime) => {
        query.whereBetween('occurs_at', [
            date.set({ hour: 0, minute: 0 }).toISO(),
            date.set({ hour: 23, minute: 59 }).toISO(),
        ])
    })

    /**
     * filtering options to query for their oid belonging
     * @param categoryId the number for the id to query for
     */
    public static filterOutOids = scope((query, oids?: Array<number>) => {
        if (oids) {
            query.whereNotIn('nationId', oids)
        }
    })

    /**
     * filtering options to query for members only
     * @param value the boolean for the wether the query is for members or not
     */
    public static forMembers = scope((query, value: boolean) => {
        query.where('onlyMembers', value)
    })

    /**
     * filtering options to query for students only
     * @param value the boolean for the wether the query is for students or not
     */
    public static forStudents = scope((query, value: boolean) => {
        query.where('onlyStudents', value)
    })

    /**
     * filtering options to exclude events/messages for their category that they belong to
     * @note Right now, only events have categories, but in the future there
     * might be news belonging to categories
     * @param categoryId the the id to query for
     */
    public static filterOutCategories = scope((query, categories?: Array<number>) => {
        if (categories) {
            query.whereNotIn('categoryId', categories)
        }
    })

    /**
     * filtering options to query events/messages for their categoryId
     * @note Right now, only events have categories, but in the future there
     * might be news belonging to categories
     * @param categoryId the id to query for
     */
    public static perCategory = scope((query, categoryId: number) => {
        query.where('categoryId', categoryId)
    })
}
