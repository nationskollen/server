/**
 * This module provides some functionality that comes in handy and is needed at
 * places around in the system.
 *
 * @category Utils
 * @module Serialize
 */

import { MINIMUM_PAGE } from 'App/Utils/Constants'

/**
 * Helper function for getting the page number from a request.
 * If no page number was specified, {@link MINIMUM_PAGE} is returned.
 * This was added because during typescript compilation in production build,
 * it would fail and the server could not start. This was a result of the `??`
 * operator.
 */
export function getPageNumber(page?: number) {
    if (page) {
        return page
    }

    return MINIMUM_PAGE
}
