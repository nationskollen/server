import Menu from 'App/Models/Menu'
import MenuItem from 'App/Models/MenuItem'
import Nation from 'App/Models/Nation'
import Location from 'App/Models/Location'
import OpeningHour from 'App/Models/OpeningHour'
import Event from 'App/Models/Event'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import BadRequestException from 'App/Exceptions/BadRequestException'
import MenuNotFoundException from 'App/Exceptions/MenuNotFoundException'
import MenuItemNotFoundException from 'App/Exceptions/MenuItemNotFoundException'
import NationNotFoundException from 'App/Exceptions/NationNotFoundException'
import LocationNotFoundException from 'App/Exceptions/LocationNotFoundException'
import OpeningHourNotFoundException from 'App/Exceptions/OpeningHourNotFoundException'
import { RequestValidatorNode, ParsedTypedSchema, TypedSchema } from '@ioc:Adonis/Core/Validator'

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

export function getMenu(request: RequestContract): Menu {
    const { menu } = request

    if (!menu) {
        throw new MenuNotFoundException()
    }

    return menu
}

export function getMenuItem(request: RequestContract): MenuItem {
    const { menuItem } = request

    if (!menuItem) {
        throw new MenuItemNotFoundException()
    }

    return menuItem
}

export function getEvent(request: RequestContract): Event {
    const { event } = request

    if (!event) {
        throw new EventNotFoundException()
    }

    return event
}

export async function getValidatedData<T extends ParsedTypedSchema<TypedSchema>>(
    request: RequestContract,
    validator: RequestValidatorNode<T>
) {
    const changes = await request.validate(validator)

    // Make sure that there is updated data from the request
    if (Object.keys(changes).length === 0) {
        throw new BadRequestException('Could not update, validated request body is empty')
    }

    return changes
}
