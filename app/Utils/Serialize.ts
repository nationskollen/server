/**
 * This module provides some functionality that comes in handy and is needed at
 * places around in the system.
 *
 * @category Utils
 * @module Serialize
 */
import { DateTime } from 'luxon'
import { HOSTNAME } from 'App/Utils/Constants'

/**
 * Converts value 0 and 1 to boolean operands
 * @param value the value to convert to a boolean
 */
export function toBoolean(value: number) {
    return Boolean(value)
}

/**
 * Provides the absolute path
 * @param value
 */
export function toAbsolutePath(value: string) {
    return value ? HOSTNAME + '/' + value : value
}

/**
 * Converts incoming time to format HH:mm
 * @param value the value to convert to HH:mm
 */
export function toHour(value: DateTime) {
    return value ? value.toFormat('HH:mm') : value
}

/**
 * Converts incoming value to ISO format
 * @param value
 */
export function toISO(value?: DateTime) {
    return value ? value.setZone('utc+2').toISO() : value
}
