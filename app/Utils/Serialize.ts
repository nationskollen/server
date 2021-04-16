import { DateTime } from 'luxon'
import { HOSTNAME } from 'App/Utils/Constants'

export function toBoolean(value: number) {
    return Boolean(value)
}

export function toAbsolutePath(value: string) {
    return value ? HOSTNAME + '/' + value : value
}

export function toHour(value: DateTime) {
    return value ? value.toFormat('HH:mm') : value
}

export function toISO(value?: DateTime) {
    return value ? value.setZone('utc').toISO() : value
}
