import test from 'japa'
import Contact from 'app/Models/Contact'
import supertest from 'supertest'
import { BASE_URL } from 'App/Utils/Constants'
import { TestNationContract, createTestContact, createTestNation } from 'App/Utils/Test'

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
        assert.equal(data.name, contact.name)
        assert.equal(data.telephone, contact.telephone)
    })
})

test.group('Contact update', async (group) => {
    let nation: TestNationContract
    let contact: Contact

    group.before(async () => {
        nation = await createTestNation()
        contact = await createTestContact(nation.oid)
    })

    test('ensure that updating a contact is viable', async (assert) => {
        const { text } = await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'fadde',
                telephone: '0700000000',
            })
            .expect(200)

        const data = JSON.parse(text)
        assert.equal(data.name, 'fadde')
    })

    test('ensure that updating a contact fails upon incorrect input', async () => {
        await supertest(BASE_URL)
            .put(`/nations/${nation.oid}/contact/${contact.id}`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 600,
                telephone: '0700000000',
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
    const contactData = {
        name: 'fadde',
        email: 'fadde@faddson.se',
        telephone: '0700000000',
        web_url: 'https://fadde.se',
    }

    group.before(async () => {
        nation = await createTestNation()
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

        assert.equal(data.name, contactData.name)
        assert.equal(data.telephone, contactData.telephone)
        assert.equal(data.web_url, contactData.web_url)
    })

    test('ensure that creating contact information must have specified fields', async () => {
        await supertest(BASE_URL)
            .post(`/nations/${nation.oid}/contact`)
            .set('Authorization', 'Bearer ' + nation.token)
            .send({
                name: 'hello',
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
})
