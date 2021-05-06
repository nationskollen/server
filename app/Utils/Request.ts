/**
 * This module provides the ability to send a "request" with ease internally
 * for the system in order to achieve cleaner, readable and more maintanable
 * code
 *
 * (**REFACTORING**) Combine all function below into single function
 *
 * @category Utils
 * @module Request
 */
import Menu from 'App/Models/Menu'
import MenuItem from 'App/Models/MenuItem'
import Nation from 'App/Models/Nation'
import Individual from 'App/Models/Individual'
import Location from 'App/Models/Location'
import OpeningHour from 'App/Models/OpeningHour'
import Event from 'App/Models/Event'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import BadRequestException from 'App/Exceptions/BadRequestException'
import MenuNotFoundException from 'App/Exceptions/MenuNotFoundException'
import EventNotFoundException from 'App/Exceptions/EventNotFoundException'
import NationNotFoundException from 'App/Exceptions/NationNotFoundException'
import IndividualNotFoundException from 'App/Exceptions/IndividualNotFoundException'
import LocationNotFoundException from 'App/Exceptions/LocationNotFoundException'
import MenuItemNotFoundException from 'App/Exceptions/MenuItemNotFoundException'
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

export function getIndividual(request: RequestContract): Individual {
    const { individual } = request

    if (!individual) {
        throw new IndividualNotFoundException()
    }

    return individual
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
    validator: RequestValidatorNode<T>,
    skipLengthCheck?: boolean
) {
    const changes = await request.validate(validator)

    // Sometime we don't want to throw if the data is empty,
    // e.g. filtering with query strings
    if (!skipLengthCheck) {
        // Make sure that there is updated data from the request
        if (Object.keys(changes).length === 0) {
            throw new BadRequestException('Could not update, validated request body is empty')
        }
    }

    return changes
}
