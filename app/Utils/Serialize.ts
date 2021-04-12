import { HOSTNAME } from 'App/Utils/Constants'

export function toBoolean(value: number) {
    return Boolean(value)
}

export function toAbsolutePath(value: string) {
    return value ? HOSTNAME + '/' + value : value
}
