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
     * Filtering options to query events before specified date
     */
    public static beforeDate = scope((query, date: DateTime) => {
        query.where('occurs_at', '<', date.toISO())
    })

    /**
     * Filtering options to query events after specified date
     */
    public static afterDate = scope((query, date: DateTime) => {
        /**
         * NOTE: Simply filtering by '>' with 'date.toISO()' does not work.
         * No idea why this is, but I don't really care either.
         */
        query.where('occurs_at', '>=', date.plus({ day: 1 }).toISO())
    })

    /**
     * Filtering options to query events at specified date
     */
    public static onDate = scope((query, date: DateTime) => {
        query.whereBetween('occurs_at', [
            date.set({ hour: 0, minute: 0 }).toISO(),
            date.set({ hour: 23, minute: 59 }).toISO(),
        ])
    })
}
