import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import request from 'supertest'
import { LinkController } from '../../src/controllers/linkController'
import DocumentController from "../../src/controllers/documentController"
import { DocCoordinates } from "../../src/models/document_coordinate"
import { Stakeholder } from "../../src/models/stakeholder"
import Link from '../../src/models/link'
import { app } from "../../index";
import db from "../../src/db/db"
import { setup } from "../../src/db/setup";
import { cleanup } from "../../src/db/cleanup";
import { Database } from "sqlite3";
import { Role } from "../../src/models/user"

const baseURL = '/kiruna/link'

describe('linkRoutes/linkController Integration Tests', () => {

    const documentCcontroller = new DocumentController();
    const controller = new LinkController();
    const testUrbanPlanner = { username: "urban_planner", name: "urban", surname: "planner", password: "admin", role: Role.PLANNER };
    const testResident = { username: "resident", name: "resident", surname: "resident", password: "admin", role: Role.RESIDENT };
    const testId = 1;
    const testLink = new Link(1, "Update");
    const testLink2 = new Link(2, "Connection");
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testDocument = new DocCoordinates(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description",[]);
    const testDocument2 = new DocCoordinates(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2",[]);

    // Helper function that logs in a user and returns the cookie
    // Can be used to log in a user before the tests or in the tests
    const login = async (userInfo: any) => {
        return new Promise<string>((resolve, reject) => {
            request(app)
                .post(`/kiruna/sessions`)
                .send(userInfo)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(res.header["set-cookie"][0]);
                });
        });
    }

    beforeAll(async () => {
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
    beforeEach(async () => {
    
        await cleanup();

        const runAsync = (query: string, params: string[]) => {
            return new Promise((resolve, reject) => {
                db.run(query, params, function (err) {
                    if (err) {
                        reject(new Error('Database insertion error: ' + err.message));  
                    } else {
                        resolve(this);  
                    }
                });
            });
        };
    

        await runAsync(`INSERT INTO stakeholders (name, category) VALUES (?, ?)`, ["John", "urban developer"]);
        await runAsync(`INSERT INTO stakeholders (name, category) VALUES (?, ?)`, ["Bob", "urban developer"]);
        await runAsync(`INSERT INTO links (name) VALUES (?)`, ["Update"]);
        await runAsync(`INSERT INTO links (name) VALUES (?)`, ["Connection"]);
        await runAsync(`INSERT INTO users (username, name, surname, role, password, salt) VALUES (?, ?, ?, ?, ?, ?)`, 
                       ["urban_planner", "urban", "planner", "Urban Planner", "84f2763be5408b77c05292178b08b4a3", "1f39956c7101ff188ce0a015786f0493"]);
        await runAsync(`INSERT INTO users (username, name, surname, role, password, salt) VALUES (?, ?, ?, ?, ?, ?)`, 
                       ["resident", "resident", "resident", "Resident", "84f2763be5408b77c05292178b08b4a3", "1f39956c7101ff188ce0a015786f0493"]);

        jest.resetAllMocks();
    });
    

    describe('POST /', () => {
        test("It should add a link and return 200", async () => {

            const cookie = await login(testUrbanPlanner);

            await expect(documentCcontroller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(documentCcontroller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(200);

            expect(response.body).toEqual({ message: "Link added successfully" });

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        })

        test('It should return 422 status if the body is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/").send({}).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc1 is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + '/')
                .send({
                    idDoc1: "abc",
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc1 is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + '/')
                .send({
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc2 is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: "abc",
                    idLink: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc2 is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idLink: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idLink is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: "abc"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idLink is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            const cookie = await login(testResident);

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(403);

            expect(response.body.error).toBe('User is not an urban planner');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 503 if there is an error', async () => {
            const cookie = await login(testUrbanPlanner);

            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });

    });

    describe('DELETE /', () => {
        test("It should delete a link and return 200", async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentCcontroller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(documentCcontroller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.addLink(1, 2, 1)).resolves.toBeUndefined();

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(200);

            expect(response.body).toEqual({ message: "Link deleted successfully" });

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

        })

        test('It should return 422 status if the body is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + '/')
                .send({}).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc1 is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: "abc",
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc1 is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + '/')
                .send({
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc2 is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);
            await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: "abc",
                    idLink: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc2 is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idLink: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idLink is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: "abc"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idLink is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            const cookie = await login(testResident);

            jest.spyOn(controller, "deleteLink").mockResolvedValueOnce(undefined);

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(403);

            expect(response.body.error).toBe('User is not an urban planner');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 503 if there is an error', async () => {
            const cookie = await login(testUrbanPlanner);

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                }).set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });

    })

    describe('PATCH /', () => {
        test("It should update a link and return 200", async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentCcontroller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(documentCcontroller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.addLink(1, 2, 1)).resolves.toBeUndefined();

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                }).set("Cookie", cookie).expect(200);

            expect(response.body).toEqual({ message: "Link updated successfully" });

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the body is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + '/')
                .send({}).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc1 is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: "abc",
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc1 is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + '/')
                .send({
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc2 is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: "abc",
                    oldLinkId: 1,
                    newLinkId: 2
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc2 is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    oldLinkId: 1,
                    newLinkId: 2
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if oldLinkId is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: "abc",
                    newLinkId: 2
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if oldLinkId is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    newLinkId: 2
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if newLinkId is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: "abc"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if newLinkId is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            const cookie = await login(testResident);

            jest.spyOn(controller, "updateLink").mockResolvedValueOnce(undefined);

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                }).set("Cookie", cookie).expect(403);

            expect(response.body.error).toBe('User is not an urban planner');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 503 if there is an error', async () => {
            const cookie = await login(testUrbanPlanner);

            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                }).set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });
    })

    describe('GET /', () => {

        test('It should retrieve all the links and return 200 status', async () => {

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testLink,testLink2]);

        });

        test('It should return 503 if there is an error', async () => {

            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            dbSpy.mockRestore();
        });

    })

})
