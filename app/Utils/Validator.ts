/**
 * @category Utils
 * @module Validator
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Retrieves the oid reference
 * @param ctx
 */
export function getOidRef(ctx: HttpContextContract) {
    if (ctx.request && ctx.request.nation) {
        return ctx.request.nation.oid
    }

    return undefined
}
