import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import DocumentController from "../../src/controllers/documentController"
import { LinkController } from "../../src/controllers/linkController"
import { Document } from "../../src/models/document"
import { Stakeholder } from "../../src/models/stakeholder"
import { DocLink } from "../../src/models/document_link"
import Link from "../../src/models/link"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";
import { app } from "../../index";
import request from 'supertest';
import { Role } from "../../../common_models/user"

const baseURL = "/kiruna/doc"

describe('documentRoutes/documentController Integration tests', () => {

    const testId = 1;
    const controller = new DocumentController();
    const linkController = new LinkController();
    const testUrbanPlanner = { username: "urban_planner", name: "urban", surname: "planner", password: "admin", role: Role.PLANNER };
    const testResident = { username: "resident", name: "resident", surname: "resident", password: "admin", role: Role.RESIDENT };
    const testLink = new Link(1, "Update");
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testDocument = new Document(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
    const testNewDocument = new Document(testId, "new title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "new description");
    const testDocument2 = new Document(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2");
    const testDocLink = new DocLink(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", testLink);
    const mockResourceData =  Buffer.from("data", 'base64')
  
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

        test('It should register a document and return 200 status', async () => {

            const cookie = await login(testUrbanPlanner);

            const response = await request(app).post(baseURL + '/')
                .send({
                    title: "title",
                    stakeHolders: [testStakeholder1, testStakeholder2],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(200);

            expect(response.body).toEqual(testDocument);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the body is missing', async () => {

            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({}).set("Cookie", cookie).expect(422);


            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if title is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: 1,
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if title is missing', async () => {
            const cookie = await login(testUrbanPlanner);
            await request(app).post(baseURL + "/")
                .send({
                    title: null,
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if stakeHolders is not an array', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: { id: 1, name: "John", role: "urban developer" },
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if stakeHolders is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: null,
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if scale is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: 1,
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if scale is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: null,
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if issuanceDate is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: 1,
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if issuanceDate is missing', async () => {

            const cookie = await login(testUrbanPlanner);


            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: null,
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if type is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: 1,
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if type is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: null,
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if language is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: 1,
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if pages is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: 300,
                    description: "description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if description is not a string', async () => {
            const cookie = await login(testUrbanPlanner);
            await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const cookie = await login(testUrbanPlanner);

            const response = await request(app).post(baseURL + '/')
                .send({
                    title: "title",
                    stakeHolders: [testStakeholder1, testStakeholder2],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            const cookie = await login(testResident);

            const response = await request(app).post(baseURL + '/')
                .send({
                    title: "title",
                    stakeHolders: [testStakeholder1, testStakeholder2],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
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

            const response = await request(app).post(baseURL + "/")
                .send({
                    title: "title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description"
                }).set("Cookie", cookie).expect(503);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });

    });

    describe('GET /', () => {
        test('It should retrieve all the documents and return 200 status', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            const response = await request(app).get(baseURL + "/").expect(200);

            expect(response.body).toEqual([testDocument, testDocument2]);

        });

        test('It should return an empty array if there are no documents and return 200 status', async () => {

            const response = await request(app).get(baseURL + "/").expect(200);

            expect(response.body).toEqual([]);
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

    });

    describe('GET /:id', () => {

        test('It should retrieve the document with the specified id and return 200 status', async () => {
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).get(baseURL + `/${testId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(testDocument);
        });

        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL + `/abc`);

            expect(response.status).toBe(422);
        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null);

            expect(response.status).toBe(422);
        });

        test('It should return 503 if there is an error', async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).get(baseURL + `/${testId}`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            dbSpy.mockRestore();
        });

    });

    describe('DELETE /:id', () => {
        test('It should delete the document with the specified id and return 200 status', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).delete(baseURL + `/${testId}`).set("Cookie", cookie).expect(200);

            expect(response.body).toEqual({ message: "Document deleted successfully" });


            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });


        test('It should return 422 status if the param is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + `/abc`).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the param is null', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + `/` + null).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).delete(baseURL + `/${testId}`);

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            const cookie = await login(testResident);

            jest.spyOn(controller, "deleteDocument").mockResolvedValueOnce(undefined);

            const response = await request(app).delete(baseURL + `/${testId}`).set("Cookie", cookie).expect(403);;

            expect(response.body.error).toBe('User is not an urban planner');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 503 if there is an error', async () => {
            const cookie = await login(testUrbanPlanner);

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).delete(baseURL + `/${testId}`).set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });
    });

    describe('PATCH /:id', () => {
        test('It should edit the document with the specified id and return 200 status', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [testStakeholder1, testStakeholder2],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(200);

            expect(response.body).toEqual(testNewDocument);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the param is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/abc`).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the param is null', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/` + null).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the body is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({}).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if title is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: 1,
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if title is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: null,
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if stakeHolders is not an array', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: { id: 1, name: "John", role: "urban developer" },
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if stakeHolders is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: null,
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if scale is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: 1,
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if scale is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: null,
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if issuanceDate is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: 1,
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if issuanceDate is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: null,
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if type is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: 1,
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if type is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: null,
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if language is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: 1,
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if pages is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: 300,
                    description: "new description"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if description is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [testStakeholder1, testStakeholder2],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).expect(401);

            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            const cookie = await login(testResident);

            const response = await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [testStakeholder1, testStakeholder2],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
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

            const response = await request(app).patch(baseURL + `/${testId}`)
                .send({
                    title: "new title",
                    stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                    scale: "1:1",
                    issuanceDate: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "new description"
                }).set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });
    });

    describe('GET /:id/links', () => {
        test('It should retrieve all the links connected to a document with the specified id and return 200 status', async () => {
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await (linkController.addLink(1, 2, 1));

            const response = await request(app).get(baseURL + `/${testId}/links`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testDocLink]);

        });

        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL + `/abc/links`);

            expect(response.status).toBe(422);

        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null + "links");

            expect(response.status).toBe(422);

        });

        test('It should return 503 if there is an error', async () => {

            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).get(baseURL + `/${testId}/links`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            dbSpy.mockRestore();
        });
    });

    describe('GET /:id/title', () => {
        test('It should retrieve the title of a document with the specified id and return 200 status', async () => {
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).get(baseURL + `/${testId}/title`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual("title");

        });


        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL + `/abc/title`);

            expect(response.status).toBe(422);

        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null + "title");

            expect(response.status).toBe(422);

        });

        test('It should return 503 if there is an error', async () => {

            const dbSpy = jest.spyOn(db, 'get').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).get(baseURL + `/${testId}/title`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            dbSpy.mockRestore();
        });
    });

    describe('GET /:id/description', () => {
        test('It should retrieve the description of a document with the specified id and return 200 status', async () => {
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).get(baseURL + `/${testId}/description`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual("description");

        });

        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL + `/abc/description`);

            expect(response.status).toBe(422);

        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null + "description");

            expect(response.status).toBe(422);

        });

        test('It should return 503 if there is an error', async () => {
            const dbSpy = jest.spyOn(db, 'get').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });


            const response = await request(app).get(baseURL + `/${testId}/description`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            dbSpy.mockRestore();
        });
    });

    describe('GET /:id/issuanceDate', () => {
        test('It should retrieve the issuance date of a document with the specified id and return 200 status', async () => {
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).get(baseURL + `/${testId}/issuanceDate`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual("2020-10-10");

        });

        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL + `/abc/issuanceDate`);

            expect(response.status).toBe(422);

        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null + "issuanceDate");

            expect(response.status).toBe(422);

        });

        test('It should return 503 if there is an error', async () => {
            const dbSpy = jest.spyOn(db, 'get').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).get(baseURL + `/${testId}/issuanceDate`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            dbSpy.mockRestore();
        });
    });

    describe('POST /type', () => {
        test('It should retrieve all the documents of the same specified type and return 200 status', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            const response = await request(app).post(baseURL + "/type")
                .send({ type: "Informative document" });

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testDocument, testDocument2]);

        });

        test('It should retrieve an empty array if there are no documents of the specified type and return 200 status', async () => {

            const response = await request(app).post(baseURL + "/type")
                .send({ type: "Material effect" });

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);

        });

        test('It should return 422 status if the body is missing', async () => {
            const response = await request(app).post(baseURL + "/type")
                .send({});
            expect(response.status).toBe(422);

        });

        test('It should return 422 status if type is not a string', async () => {
            const response = await request(app).post(baseURL + "/type")
                .send({ type: 1 });

            expect(response.status).toBe(422);

        });

        test('It should return 422 status if type is null', async () => {
            const response = await request(app).post(baseURL + "/type")
                .send({ type: null });
            expect(response.status).toBe(422);

        });

        test('It should return 503 if there is an error', async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).post(baseURL + "/type")
                .send({ type: "Material effect" });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            dbSpy.mockRestore();
        });
    });

    describe('POST /res', () => {

        const date = "2020-10-10";

        test('It should add a resource to a document and return 200 status', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await request(app).post(baseURL + '/res')
                .send({
                    idDoc: 1,
                    name: "title",
                    data: date
                }).set("Cookie", cookie).expect(200);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the body is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/res")
                .send({}).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if docId is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/res")
                .send({
                    idDoc: "abc",
                    name: "title",
                    data: date
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if docId is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/res")
                .send({
                    name: "title",
                    data: date
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if name is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/res")
                .send({
                    idDoc: 1,
                    name: 1,
                    data: date
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if name is an empty string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/res")
                .send({
                    idDoc: 1,
                    name: "",
                    data: date
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if name is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/res")
                .send({
                    idDoc: 1,
                    data: date
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).post(baseURL + '/res')
                .send({
                    idDoc: 1,
                    name: "title",
                    data: date
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });


        test('It should return 403 status if the user is not an urban planner', async () => {

            const cookie = await login(testResident);

            const response = await request(app).post(baseURL + '/res')
                .send({
                    idDoc: 1,
                    name: "title",
                    data: date
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

            const response = await request(app).post(baseURL + "/res")
                .send({
                    idDoc: 1,
                    name: "title",
                    data: date
                }).set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });
    });

    describe('GET /res/:idDoc/:idRes', () => {

        test('It should get a specific resource to a document and return 200 status', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addResourceToDocument(1, "Resource 1", "data")).resolves.toBeUndefined();

            const response = await request(app).get(baseURL + '/res/1/1')
 
            expect(response.status).toBe(200);

            expect(Buffer.from(response.body.data)).toEqual(Buffer.from(mockResourceData));
        });

        test('It should return 422 status if the parms are missing', async () => {
            const response = await request(app).get(baseURL+"/res")
            expect(response.status).toBe(422); 

        });

        test('It should return 422 status if docId is not numeric', async () => {
            const response = await request(app).get(baseURL+"/res/test/2")
            expect(response.status).toBe(422); 
  
        });

        test('It should return 422 status if resId is not a number', async () => {
            const response = await request(app).get(baseURL+"/res/1/test")
            expect(response.status).toBe(422); 

        });

        test('It should return 503 if there is an error', async () => {

            const dbSpy = jest.spyOn(db, 'get').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).get(baseURL + '/res/1/2')

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            dbSpy.mockRestore();
        });
    });

    describe('GET /res-all/:idDoc', () => {

        test('It should get a all resources related to a document and return 200 status', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addResourceToDocument(1, "Resource 1", "data")).resolves.toBeUndefined();

            await expect(controller.addResourceToDocument(1, "Resource 2", "data")).resolves.toBeUndefined();

            const response = await request(app).get(baseURL + '/res-all/1');
 
            expect(response.status).toBe(200);

            expect(response.body).toEqual([
                expect.objectContaining({
                    id: 1,
                    idDoc: 1,
                    data: null,
                    name: 'Resource 1',
                    // No need to check uploadTime due to delays from db
                }),
                expect.objectContaining({
                    id: 2,
                    idDoc: 1,
                    data: null,
                    name: 'Resource 2',
                    // No need to check uploadTime due to delays from db
                }),
            ]);

        });

        test('It should return 422 status if the docId is missing', async () => {
            const response = await request(app).get(baseURL+"/res-all/")
            expect(response.status).toBe(422); 
 
        });

        test('It should return 422 status if docId is not numeric', async () => {
            const response = await request(app).get(baseURL+"/res-all/test")
            expect(response.status).toBe(422); 
    
        });

        test('It should return 503 if there is an error', async () => {

            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).get(baseURL + '/res-all/1')

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

            dbSpy.mockRestore();
        });
    });

    describe('DELETE /res/:idDoc/:name', () => {

        test('It should delete a resources and return 200 status', async () => {
            const cookie = await login(testUrbanPlanner);

            jest.spyOn(controller, "deleteResource").mockResolvedValueOnce();

            const response = await request(app).delete(baseURL + '/res/1/testName').set("Cookie", cookie).expect(200);

            expect(response.body).toEqual({ message: 'Document deleted successfully' });

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if docId is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + '/res/test/testName').set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

        });
        

        test('It should return 422 status if both of the parms are missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + '/res').set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).delete(baseURL + '/res/1/testName')
 
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        
        test('It should return 403 status if the user is not an urban planner', async () => {
            
            const cookie = await login(testResident);

            jest.spyOn(controller, "deleteResource").mockResolvedValueOnce();

            const response = await request(app).delete(baseURL + '/res/1/testName').set("Cookie", cookie).expect(403);

            expect(response.body.error).toBe('User is not an urban planner');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

        });

        test('It should return 503 if there is an error', async () => {

            const cookie = await login(testUrbanPlanner);

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).delete(baseURL + '/res/1/testName').set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });
    });
});