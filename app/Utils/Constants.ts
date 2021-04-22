/**
 * Generates the hostname for the API.
 * Mainly used for calculating the absolute URL for public assets.
 *
 * @category Utils
 * @module Constants
 *
 */
export const HOSTNAME = process.env.ASSET_HOSTNAME
    ? process.env.ASSET_HOSTNAME
    : `http://${process.env.HOST}:${process.env.PORT}`

export const BASE_URL = `${HOSTNAME}/api/v1`

export const UPLOAD_QUALITY_VALUE = 45
export const MINIMUM_PAGE = 1