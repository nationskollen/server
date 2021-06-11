/**
 * This file contains different things that help our testing for the server.
 *
 * @category Utils
 * @module TestUtils
 */

import {
    UserFactory,
    NewsFactory,
    MenuFactory,
    EventFactory,
    NationFactory,
    MenuItemFactory,
    LocationFactory,
    IndividualFactory,
    ContactFactory,
    OpeningHourFactory,
    OpeningHourExceptionFactory,
} from 'Database/factories/index'

import { DateTime } from 'luxon'
import supertest from 'supertest'
import Category from 'App/Models/Category'
import PermissionType from 'App/Models/PermissionType'
import { BASE_URL } from 'App/Utils/Constants'

/**
 * @interface TestNationContract
 */
export interface TestNationContract {
    oid: number
    token: string
    staffToken: string
    adminOtherToken: string
}

/**
 * Function that creates a staff user to use in testing
 * @param nationId The id the user will be apart of
 * @param nationAdmin If the user is suppsoed to be a regular staff user or an admin in the nation
 *
 */
export async function createStaffUser(nationId: number, nationAdmin: boolean) {
    const password = 'randomuserpassword'
    const user = await UserFactory.merge({ password, nationId, nationAdmin }).create()

    const { text } = await supertest(BASE_URL)
        .post(`/users/login`)
        .send({ email: user.email, password })
        .expect(200)

    const { token, scope, oid } = JSON.parse(text)

    return {
        user,
        token,
        scope,
        oid,
    }
}

/**
 * Function that creates a test nation to use in testing
 */
export async function createTestNation(): Promise<TestNationContract> {
    const nation = await NationFactory.create()
    const admin = await createStaffUser(nation.oid, true)
    const adminOther = await createStaffUser(nation.oid + 1, true)
    const staff = await createStaffUser(nation.oid, false)

    return {
        oid: nation.oid,
        token: admin.token,
        staffToken: staff.token,
        adminOtherToken: adminOther.token,
    }
}

/**
 * Function that creates a test nation to use in testing
 */
export async function createTestUser(oid: number, admin: boolean) {
    const data = {
        fullname: 'test',
        email: 'test@test.se',
        password: 'test123',
        nationAdmin: admin,
        nation_id: oid,
    }
    return await UserFactory.merge(data).create()
}

/**
 * Function that creates a test event to test with
 * @param oid The nation the event will be from
 * @param occursAt The given date the event will occur at
 */
export async function createTestEvent(oid: number, occursAt?: DateTime, category?: boolean) {
    const mergeData = { nationId: oid }

    if (category) {
        const category = await createTestCategory()
        mergeData['categoryId'] = category.id
    }

    if (occursAt) {
        mergeData['occursAt'] = occursAt.setZone('utc+2')
    }

    return EventFactory.merge(mergeData).create()
}

export async function createTestCategory() {
    return Category.create({
        name: 'testCategory',
    })
}

export async function createTestPermissions() {
    return PermissionType.create({
        type: 'testPermission',
    })
}

export async function createTestNews(oid: number) {
    return NewsFactory.merge({
        nationId: oid,
    }).create()
}

export async function createTestContact(oid: number) {
    return ContactFactory.merge({
        nationId: oid,
    }).create()
}

export async function createTestIndividual(oid: number) {
    return IndividualFactory.merge({
        nationId: oid,
    }).create()
}

/**
 * Function that creates a test location to test with
 * @param oid The nation the location will be from
 */
export async function createTestLocation(oid: number) {
    return LocationFactory.merge({ nationId: oid }).create()
}

/**
 * Function that creates a test opening hour to test with
 * @param lid The location the openingHour will be from
 */
export async function createTestOpeningHour(lid: number) {
    return OpeningHourFactory.merge({ locationId: lid }).create()
}

/**
 * Function that creates a test opening hour **exception** to test with
 * @param lid The location the openingHour will be from
 */
export async function createTestExceptionOpeningHour(lid: number) {
    return OpeningHourExceptionFactory.merge({ locationId: lid }).create()
}

/**
 * Function that creates a test menu
 * @param oid The nation the menu will be apart of
 * @param lid The location the menu will be apart of
 */
export async function createTestMenu(oid: number, lid: number) {
    return MenuFactory.merge({ nationId: oid, locationId: lid }).create()
}

/**
 * Creates a test MenuItem
 * @param mid menu id for where the menuItem is to be placed within
 */
export async function createTestMenuItem(mid: number) {
    return MenuItemFactory.merge({ menuId: mid }).create()
}

/**
 * Extracts the relative path given an absolutePath
 * @param absolutePath the absolute path
 */
export function toRelativePath(absolutePath: string) {
    return absolutePath.substring(absolutePath.lastIndexOf('/'))
}
