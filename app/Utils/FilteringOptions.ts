/**
 *@todo refactor filtering functions and place them in this file
 *
 * This file contains all the filtering options that can be used in controllers.
 *
 * @category Utils
 * @module FilteringOptions
 */

import { DateTime } from 'luxon'
import Event from 'App/Models/Event'
import { ExtractScopes } from '@ioc:Adonis/Lucid/Model'

export default class FilteringOptions {
    /**
     * Method that applies given filters depedning on what type of event to
     * filter after
     * @param scopes - The different scopes that exists in the system
     * @param filters - The filter to apply
     */
    public applyFilters(
        scopes: ExtractScopes<typeof Event>,
        filters: Record<string, DateTime | undefined>
    ) {
        if (filters.date) {
            // Filter based on selected date
            scopes.onDate(filters.date)
        } else {
            if (filters.before) {
                // Filter based on when the event ends, i.e. all events before
                // a certain date
                scopes.beforeDate(filters.before)
            }

            if (filters.after) {
                // Filter based on when the event start, i.e. all events after
                // a certain date
                scopes.afterDate(filters.after)
            }
        }

        // Order events based on the 'occurs_at' field
        scopes.inOrder()
    }

    /**
     * Filtering method for events in order to filter after categories
     * @param scopes - The different scopes that exists in the system
     * @param category - The category to apply filter after
     */
    public applyCategory(scopes: ExtractScopes<typeof Event>, category?: number) {
        if (category) {
            scopes.perCategory(category)
        }
    }

    /**
     * Filtering method for events in order to filter after exluded categories
     * @param scopes - The different scopes that exists in the system
     * @param excludeCategory - The category to apply filter after
     */
    public applyExclusionCategory(scopes: ExtractScopes<typeof Event>, excludeCategory?: string) {
        if (!excludeCategory) {
            return
        }

        const initial: Array<number> = []
        const parsed = excludeCategory.split(',').reduce((reducedArray, oid) => {
            const tmp = parseInt(oid)

            if (!isNaN(tmp)) {
                reducedArray.push(tmp)
            }

            return reducedArray
        }, initial)

        scopes.filterOutCategories(parsed)
    }

    public applyInclusionFilter(
        scopes: ExtractScopes<typeof Event>,
        student?: boolean,
        membership?: boolean
    ) {
        if (membership !== undefined) {
            scopes.forMembers(membership)
        }

        if (student !== undefined) {
            scopes.forStudents(student)
        }
    }

    public applyExclusionOids(
        scopes: ExtractScopes<typeof Event>,
        excludeOids?: string | undefined
    ) {
        if (excludeOids) {
            const initial: Array<number> = []
            const parsed = excludeOids.split(',').reduce((reducedArray, oid) => {
                const tmp = parseInt(oid)

                if (!isNaN(tmp)) {
                    reducedArray.push(tmp)
                }

                return reducedArray
            }, initial)

            scopes.filterOutOids(parsed)
        }
    }
}
