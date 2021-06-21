import test from 'japa'
import Contact from 'app/Models/Contact'
import supertest from 'supertest'
import PermissionType from 'App/Models/PermissionType'
import { BASE_URL } from 'App/Utils/Constants'
import { Permissions } from 'App/Utils/Permissions'
import {
    TestNationContract,
    createTestContact,
    createTestNation,
    assignPermissions,
} from 'App/Utils/Test'

test.group('Contact fetch', async (group) => {
    let nation: TestNationContract
    let contact: Contact

    group.before(async () => {
        nation = await createTestNation()
        contact = await createTestContact(nation.oid)
    })

    test('ensure that you can fetch contact information from nation', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/nations/${nation.oid}/contact`).expect(200)

        const data = JSON.parse(text)
        assert.equal(data.telephone, contact.telephone)
        assert.equal(data.web_url, contact.webURL)
        assert.equal(data.email, contact.email)
    })

    test('ensure that fetching for contact information in a nation that is missing contact information returns nothing', async () => {
        const nation2 = await createTestNation()
        await supertest(BASE_URL).get(`/nations/${nation2.oid}/contact`).expect(204)
    })
})

test.group('Contact update', async (group) => {
    let nation: TestNationContract
    let permissions: Array<PermissionType>
    let contact: Contact

    group.before(async () => {
        nation = await createTestNation()
        contact = await createTestContact(nation.oid)

        permissions = await PermissionType.query().where('type', Permissions.Contact)

        await assignPermissions(nation.adminUser, permissions)
    })

    test('ensure that updating a contact is viable', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                telephone: '0700000000',
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.telephone, '0700000000')
    })

    test("ensure that updating a telephone needs format 'sv-SE'", async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                telephone: '0818-70023000000',
            })
            .expect(422)
    })

    test('ensure that updating a contact fails upon incorrect input', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                telephone: 600,
            })
            .expect(422)
    })

    test('ensure that updating a contact with a web url is viable', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                web_url: 'https://www.v-dala.se/',
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.web_url, 'https://www.v-dala.se/')
    })

    test("ensure that updating a contact with a web url only accepts 'http' or 'https'", async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                web_url: 'ftp://www.v-dala.se/',
            })
            .expect(422)
    })
})

test.group('Contact create', async (group) => {
    let nation: TestNationContract
    let permissions: Array<PermissionType>
    const contactData = {
        email: 'fadde@faddson.se',
        telephone: '0700000000',
        web_url: 'https://fadde.se',
    }

    group.before(async () => {
        nation = await createTestNation()

        permissions = await PermissionType.query().where('type', Permissions.Contact)

        await assignPermissions(nation.adminUser, permissions)
    })

    test('ensure that creating contact information requires a valid token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/contact`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .send(contactData)
            .expect(401)
    })

    test('ensure that creating contact information requires an admin token', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/contact`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .send(contactData)
            .expect(401)
    })

    test('ensure that creating contact information is viable', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/contact`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(contactData)
            .expect(200)

        const data = JSON.parse(text)

        assert.equal(data.telephone, contactData.telephone)
        assert.equal(data.web_url, contactData.web_url)
    })

    test('ensure that creating contact information must have specified fields', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/contact`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                email: 'hello@hello.se',
            })
            .expect(422)
    })

    test('ensure that creating contact information as admin for a nation is not able to create an contact information for another nation', async () => {
        const nation2 = await createTestNation()

        await supertest(BASE_URL)
            .post(`/nations/${nation2.oid}/contact`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send(contactData)
            .expect(401)
    })

    test('ensure that creating contact information for a nation that already has a model updates the existing one', async (assert) => {
        // This test should simply update the existing model instead of
        // replacing it since it contains the similar fields
        const { text } = await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/contact`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                email: 'test@test.se',
                telephone: '0700000000',
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.telephone, contactData.telephone)
        assert.notEqual(data.email, contactData.email)
    })

    test('ensure that creating contact information for a nation that already has a model replaces the existing one', async (assert) => {
        const { text } = await supertest(BASE_URL).get(`/nations/${nation.oid}/contact`).expect(200)
        const data = JSON.parse(text)

        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/contact`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                email: 'fahad@fahadson.com',
                telephone: '0700004050',
                web_url: 'https://denbastafadde.se',
            })
            .expect(200)

        const text1 = await supertest(BASE_URL).get(`/nations/${nation.oid}/contact`).expect(200)
        const data1 = JSON.parse(text1.text)

        assert.notEqual(data.email, data1.email)
        assert.notEqual(data.telephone, data1.telephone)
        assert.notEqual(data.web_url, data1.web_url)
    })
})

test.group('Contact delete', async (group) => {
    let nation: TestNationContract
    let permissions: Array<PermissionType>

    group.before(async () => {
        nation = await createTestNation()

        permissions = await PermissionType.query().where('type', Permissions.Contact)

        await assignPermissions(nation.adminUser, permissions)
    })

    test('ensure that deleting a contact requires a valid token', async () => {
        const contact = await createTestContact(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + 'invalidToken')
            .expect(401)
    })

    test('ensure that deleting a contact requires an admin token', async () => {
        const contact = await createTestContact(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.staffToken)
            .expect(401)
    })

    test('ensure that deleting a contact requires is viable', async () => {
        const contact = await createTestContact(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)
    })

    test('ensure that deleting a contact requires an existing contact', async () => {
        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/contact/99999999`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that deleting a contact requires an existing nation', async () => {
        const contact = await createTestContact(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/99999999/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(404)
    })

    test('ensure that deleting a contact truly removes it by trying to fetch it', async () => {
        const contact = await createTestContact(nation.oid)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .expect(200)

        await supertest(BASE_URL).get(`/nations/${nation.oid}/contact`).expect(200)
    })

    test('ensure that deleting a contact is only viable to given admins of the same nation', async () => {
        const nation2 = await createTestNation()
        const contact = await createTestContact(nation.oid)

        await assignPermissions(nation2.adminUser, permissions)

        await supertest(BASE_URL)
            .delete(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation2.token)
            .expect(401)
    })
})
