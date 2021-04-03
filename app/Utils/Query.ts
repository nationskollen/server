import Nation from 'App/Models/Nation'
import { OpeningHourTypes } from 'App/Utils/Time'

function _filterOpeningHours(query: any) {
    query.where('type', OpeningHourTypes.Default)
}

function _filterOpeningHourExceptions(query: any) {
    query.where('type', OpeningHourTypes.Exception)
}

export async function queryNationByOid(oid: number) {
    return Nation.query()
        .preload('openingHours', _filterOpeningHours)
        .preload('openingHourExceptions', _filterOpeningHourExceptions)
        .where('oid', oid)
        .first()
}

export async function queryNationAll() {
    return Nation.query()
        .preload('openingHours', _filterOpeningHours)
        .preload('openingHourExceptions', _filterOpeningHourExceptions)
}
