import Nation from 'App/Models/Nation'
import Location from 'App/Models/Location'
import OpeningHour from 'App/Models/OpeningHour'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import { RequestValidatorNode } from '@ioc:Adonis/Core/Validator'
import BadRequestException from 'App/Exceptions/BadRequestException'
import NationNotFoundException from 'App/Exceptions/NationNotFoundException'
import LocationNotFoundException from 'App/Exceptions/LocationNotFoundException'
import OpeningHourNotFoundException from 'App/Exceptions/OpeningHourNotFoundException'

export function getLocation(request: RequestContract): Location {
    const { location } = request

    if (!location) {
        throw new LocationNotFoundException()
    }

    return location
}

export function getNation(request: RequestContract): Nation {
    const { nation } = request

    if (!nation) {
        throw new NationNotFoundException()
    }

    return nation
}

export function getOpeningHour(request: RequestContract): OpeningHour {
    const { openingHour } = request

    if (!openingHour) {
        throw new OpeningHourNotFoundException()
    }

    return openingHour
}

export async function getValidatedData(
    request: RequestContract,
    validator: RequestValidatorNode<any>
) {
    const changes = await request.validate(validator)

    // Make sure that there is updated data from the request
    if (Object.keys(changes).length === 0) {
        throw new BadRequestException('Could not update, validated request body is empty')
    }

    return changes
}
