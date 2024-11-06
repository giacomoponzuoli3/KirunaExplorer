import request from 'supertest'
import express, { Express } from 'express'
import LinkRoutes from '../../src/routers/linkRoutes'
import {LinkController} from '../../src/controllers/linkController'

jest.mock('../../src/controllers/linkController')

const baseURL = '/kiruna/link'
const mockAddLink = jest.fn()
const mockDeleteLink = jest.fn()
const mockUpdateLink = jest.fn()
const mockGetAllLinks = jest.fn()

LinkController.prototype.addLink = mockAddLink
LinkController.prototype.deleteLink = mockDeleteLink
LinkController.prototype.updateLink = mockUpdateLink
LinkController.prototype.getAllLinks = mockGetAllLinks

describe('LinkRoutes Unit Tests', () => {
    let app: Express

    beforeAll(() => {
        app = express()
        app.use(express.json())
        app.use(baseURL, new LinkRoutes().getRouter())
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('POST /', () => {
        test("It should add a link and return 200", async () => {
            mockAddLink.mockResolvedValue(undefined)

            const response = await request(app)
                .post(baseURL)
                .send({ idDoc1: 1, idDoc2: 2, idLink: 3 })

            expect(response.status).toBe(200)
            expect(response.body.message).toBe("Link added successfully")
            expect(mockAddLink).toHaveBeenCalledWith(1, 2, 3)
        })

        test("It should return 422 if input validation fails", async () => {
            const response = await request(app)
                .post(baseURL)
                .send({ idDoc1: "not_a_number", idDoc2: 2, idLink: 3 })

            expect(response.status).toBe(422)
            expect(response).toHaveProperty("error")
        })
    })

    describe('DELETE /', () => {
        test("It should delete a link and return 200", async () => {
            mockDeleteLink.mockResolvedValue(undefined)

            const response = await request(app)
                .delete(baseURL)
                .send({ idDoc1: 1, idDoc2: 2, idLink: 3 })

            expect(response.status).toBe(200)
            expect(response.body.message).toBe("Link deleted successfully")
            expect(mockDeleteLink).toHaveBeenCalledWith(1, 2, 3)
        })

        test("It should return 422 if input validation fails", async () => {
            const response = await request(app)
                .delete(baseURL)
                .send({ idDoc1: 1, idDoc2: "not_a_number", idLink: 3 })

            expect(response.status).toBe(422)
            expect(response).toHaveProperty("error")
        })
    })

    describe('PATCH /', () => {
        test("It should update a link and return 200", async () => {
            mockUpdateLink.mockResolvedValue(undefined)

            const response = await request(app)
                .patch(baseURL)
                .send({ idDoc1: 1, idDoc2: 2, oldLinkId: 3, newLinkId: 4 })

            expect(response.status).toBe(200)
            expect(response.body.message).toBe("Link updated successfully")
            expect(mockUpdateLink).toHaveBeenCalledWith(1, 2, 3, 4)
        })

        test("It should return 422 if input validation fails", async () => {
            const response = await request(app)
                .patch(baseURL)
                .send({ idDoc1: 1, idDoc2: 2, oldLinkId: "not_a_number", newLinkId: 4 })

            expect(response.status).toBe(422)
            expect(response).toHaveProperty("error")
        })
    })

    describe('GET /', () => {
        test("It should retrieve all links and return 200", async () => {
            const mockLinks = [{ idDoc1: 1, idDoc2: 2, idLink: 3 }]
            mockGetAllLinks.mockResolvedValue(mockLinks)

            const response = await request(app).get(baseURL)

            expect(response.status).toBe(200)
            expect(response.body).toEqual(mockLinks)
            expect(mockGetAllLinks).toHaveBeenCalled()
        })

        test('It should return 500 if there is an error', async () => {
            mockGetAllLinks.mockRejectedValue(new Error("Database Error"))

            const response = await request(app).get(baseURL)

            expect(response.status).toBe(500)
            expect(response).toHaveProperty("error")
        })
    })
})
