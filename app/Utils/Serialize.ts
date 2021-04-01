import { DateTime } from 'luxon'

export function fromStringToOpeningHour(value: string) {
    return value ? DateTime.fromISO(value).toFormat('HH:mm') : value
}

export function fromIsoToOpeningHour(value: DateTime) {
    return value ? value.toFormat('HH:mm') : value
}

export function fromIntegerToBoolean(value: number) {
    return Boolean(value)
}
