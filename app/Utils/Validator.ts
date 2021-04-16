import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export function getOidRef(ctx: HttpContextContract) {
    if (ctx.request && ctx.request.nation) {
        return ctx.request.nation.oid
    }

    return undefined
}
