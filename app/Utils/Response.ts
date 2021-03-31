// Creates an error response with a standard format
export function createErrorResponse(status: number, message: string) {
    return {
        status,
        errors: [message],
    }
}
