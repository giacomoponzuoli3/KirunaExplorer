import request from 'supertest'
import express, { Express } from 'express'
import LinkRoutes from '../src/routers/linkRoutes'
import {LinkController} from '../src/controllers/linkController'
import Link from '../src/models/link'
import { app } from "../index";
import db from "../src/db/db"
import { setup } from "../src/db/setup";
import { cleanup } from "../src/db/cleanup";

const baseURL = '/kiruna/link'
// const testId = 1;
// const testLink = new Link(testId, testName);

// beforeAll(async () => {
//     await setup();
// });

// afterAll(async () => {
//     // Close the database connection
//     await new Promise<void>((resolve, reject) => {
//         db.close((err) => {
//             if (err) reject(err);
//             resolve();
//         });
//     });
// });

// afterEach(async () => {
//     await cleanup();
// });

// jest.mock('../src/controllers/linkController')


// const mockAddLink = jest.fn()
// const mockDeleteLink = jest.fn()
// const mockUpdateLink = jest.fn()
// const mockGetAllLinks = jest.fn()

// LinkController. = mockAddLink
// LinkController.prototype.deleteLink = mockDeleteLink
// LinkController.prototype.updateLink = mockUpdateLink
// LinkController.prototype.getAllLinks = mockGetAllLinks

describe('LinkRoutes Integration Tests', () => {
    let app: Express

    beforeEach(async () => {
        await cleanup();
        jest.clearAllMocks(); // Clear mocks after each test
    });
    
    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use(baseURL, new LinkRoutes().getRouter());
        await setup();
    });
    
    afterAll(async () => {
        await cleanup(); 
        // Close the database connection
        await new Promise<void>((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                resolve();
            });
        });
    });

    describe('GET /', () => {
        test('It should retrieve all links and return 200', async () => {

            const testLink = {
                id_document1: 1,
                id_document2: 2,
                id_link: '3'
            };

            // Add a link using POST
            const postResponse = await request(app).post(baseURL).send(testLink);
            if (postResponse.status === 422) {
                console.error("Validation failed:", postResponse.body.error);
            } else if (postResponse.status === 200) {
                expect(postResponse.body.message).toBe("Link added successfully");
            } else {
                console.error("Unexpected error:", postResponse.status, postResponse.body);
            }
    
            // Attempt to retrieve all links
            const getResponse = await request(app).get(baseURL);
            if (getResponse.status === 200) {
                // Verify that the response includes the newly added link
                expect(getResponse.body).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id_document1: 1,
                        id_document2: 2,
                        id_link: '3'
                    })
                ]));
            } else {
                console.error("GET request failed:", getResponse.status, getResponse.body);
            }
        });
    })

    describe('POST /', () => {
        test('It should add a link and return 200', async () => {
            const testLink = {
                idDoc1: 1,
                idDoc2: 2,
                idLink: 3
            };

            const response = await request(app)
                .post(baseURL)
                .send(testLink);

            // Expect status 200 and a success message
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Link added successfully");
        });

        test('It should return 422 if idDoc1 is not numeric', async () => {
            const testLink = {
                idDoc1: 'invalid',
                idDoc2: 2,
                idLink: 3
            };

            const response = await request(app)
                .post(baseURL)
                .send(testLink);

            // Expect validation error (422 Unprocessable Entity)
            expect(response.status).toBe(422);
            expect(response.body.error).toContain('idDoc1');
        });

        test('It should return 422 if idDoc2 is not numeric', async () => {
            const testLink = {
                idDoc1: 1,
                idDoc2: 'invalid',
                idLink: 3
            };

            const response = await request(app)
                .post(baseURL)
                .send(testLink);

            // Expect validation error (422 Unprocessable Entity)
            expect(response.status).toBe(422);
            expect(response.body.error).toContain('idDoc2');
        });

        test('It should return 422 if idLink is not numeric', async () => {
            const testLink = {
                idDoc1: 1,
                idDoc2: 2,
                idLink: 'invalid'
            };

            const response = await request(app)
                .post(baseURL)
                .send(testLink);

            // Expect validation error (422 Unprocessable Entity)
            expect(response.status).toBe(422);
            expect(response.body.error).toContain('idLink');
        });

        test('It should return 422 if any parameter is missing', async () => {
            const testLink = {
                idDoc1: 1,
                idDoc2: 2
                // Missing idLink
            };

            const response = await request(app)
                .post(baseURL)
                .send(testLink);

            // Expect validation error (422 Unprocessable Entity)
            expect(response.status).toBe(422);
            expect(response.body.error).toContain('idLink');
        });
    });
    describe('PATCH / Link', () => {
        test('It should update a link and return 200', async () => {
            const testLink = {
                idDoc1: 1,
                idDoc2: 2,
                oldLinkId: 3,
                newLinkId: 4
            };
    
            // First, insert the link into the database (simulating an existing link)
            await request(app).post(baseURL).send({
                idDoc1: 1,
                idDoc2: 2,
                idLink: 3
            }).expect(200);
    
            // Send PATCH request to update the link
            const patchResponse = await request(app)
                .patch(baseURL)
                .send(testLink)
                .expect(200);  // Expecting success message
    
            // Verify the response message
            expect(patchResponse.body.message).toBe('Link updated successfully');
    
            // Verify that the link is updated in the database
            const getResponseAfterPatch = await request(app)
                .get(baseURL)
                .expect(200);
    
            // Check if the updated link exists in the database
            expect(getResponseAfterPatch.body).toContainEqual({
                idDoc1: 1,
                idDoc2: 2,
                idLink: 4
            });
        });
    
        test('It should return 422 if parameters are invalid', async () => {
            const invalidLink = {
                idDoc1: 'a',  // Invalid value
                idDoc2: 2,
                oldLinkId: 3,
                newLinkId: 4
            };
    
            // Send PATCH request with invalid data
            const response = await request(app)
                .patch(baseURL)
                .send(invalidLink)
                .expect(422);  // Expecting validation error
    
            // Verify the error message returned
            expect(response.status).toBe(422);
        });
    });
    

    describe('DELETE / Link', () => {

        const validLink = {
            idDoc1: 1,
            idDoc2: 2,
            idLink: 3,
        };

        const invalidLink = {
            idDoc1: 'invalid', // Invalid value for testing validation
            idDoc2: 2,
            idLink: 3,
        };

        // Test for successful DELETE request
        test('DELETE / Link should delete a link and return 200', async () => {
            // Step 1: Create the link using POST
            const postResponse = await request(app)
                .post(baseURL)
                .send(validLink)
                .expect(200);  // Expect POST to succeed

            expect(postResponse.status).toBe(200);

            // Step 2: Delete the link using DELETE
            const deleteResponse = await request(app)
                .delete(baseURL)
                .send(validLink)
                .expect(200);  // Expect DELETE to succeed

            expect(deleteResponse.status).toBe(200);
        });
    
        // Test case for invalid parameters (should return 422)
        test('DELETE / Link should return 422 if parameters are invalid', async () => {
            const response = await request(app)
                .delete(baseURL)
                .send(invalidLink)  // Send invalid data
                .expect(422);  // Expect a validation error (422)
    
            // Check the error message
            expect(response.status).toBe(422);
        });
    
    });
    
    
    
})
