/**
 * @category Utils
 * @module Response
 *
 */

/**
 * Creates an error response with a standard format
 * @param status
 * @param message
 */
export function createErrorResponse(status: number, message: string) {
    return {
        status,
        errors: [{ message }],
    }
}
