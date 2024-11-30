import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { CoordinatesController } from "../../src/controllers/coordinatesController"
import DocumentController from "../../src/controllers/documentController"
import Coordinate from '../../src/models/coordinate';
import { Document } from '../../src/models/document';
import { LatLng } from '../../src/interfaces';
import { DocCoordinates } from '../../src/models/document_coordinate'
import { Stakeholder } from "../../src/models/stakeholder"
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";
import { app } from "../../index";
import request from 'supertest';
import { Role } from "../../src/models/user"
import { CoordinatesArrayError, CoordinatesTypeError } from "../../src/errors/coordinates";

const baseURL = "/kiruna/coordinates"

describe('coordinatesRoutes/coordinatesController Integration tests', () => {

    const testUrbanPlanner = { username: "urban_planner", name: "urban", surname: "planner", password: "admin", role: Role.PLANNER };
    const testResident = { username: "resident", name: "resident", surname: "resident", password: "admin", role: Role.PLANNER };
    const controller = new CoordinatesController();
    const documentController = new DocumentController();
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testCoordinate1 = new Coordinate(1, 1, 40.7128, -74.0060,1);
    const testCoordinate2 = new Coordinate(2, 1, -55.7128, 45.0060,1);
    const testCoordinate3 = new Coordinate(3, 2, 40.7128, -74.0060,2);
    const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };
    const coordinates: LatLng[] = [
        { lat: 40.7128, lng: -74.0060 },
        { lat: 34.0522, lng: -118.2437 },
      ];
    const newCoordinate: LatLng = { lat: -55.7128, lng: 45.0060 };
    const newCoordinates: LatLng[] = [
        { lat: -50.7128, lng: -88.0060 },
        { lat: 94.0522, lng: -18.2437 },
      ];
    const testDocument = new Document(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1]);
    const newTestDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate2]);
    const newTestDocCoordinate2 = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate2,testCoordinate3]);

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

        let query = `INSERT INTO stakeholders (name, category) VALUES (?, ?)`;
        db.run(query, ["John", "urban developer"], function (err) {
            if (err) {
                console.log("Stakeholder insertion error")
            }
        });

        query = `INSERT INTO users (username, name, surname, role, password, salt) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(query, ["urban_planner", "urban", "planner", "Urban Planner", "84f2763be5408b77c05292178b08b4a3", "1f39956c7101ff188ce0a015786f0493"], function (err) {
            if (err) {
                console.log("User insertion error")
            }
        });

        query = `INSERT INTO users (username, name, surname, role, password, salt) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(query, ["resident", "resident", "resident", "Resident", "84f2763be5408b77c05292178b08b4a3", "1f39956c7101ff188ce0a015786f0493"], function (err) {
            if (err) {
                console.log("User insertion error")
            }
        });

        jest.resetAllMocks();

    });

    describe('POST /', () => {
        test('It should set a coordinate for a document and return 200 status', async () => {

            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: coordinate
                }).set("Cookie", cookie).expect(200);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Coordinates added successfully" });

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should set multiple coordinates for a document and return 200 status', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: coordinates
                }).set("Cookie", cookie).expect(200);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Coordinates added successfully" });

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the body is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await request(app).post(baseURL + "/").send({}).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await request(app).post(baseURL + "/")
                .send({
                    idDoc: "abc",
                    coordinates: coordinate
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await request(app).post(baseURL + "/")
                .send({
                    idDoc: null,
                    coordinates: coordinate
                }).set("Cookie", cookie).expect(422);
 
            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if coordinates is not LatLng', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: "coordinate"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

        });

        test('It should return 422 status if at least on element of coordinates is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: [{ lat: 40.0, lng: 45.0 }, { lat: "invalid", lng: 90.0 }],
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if coordinates is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: null
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).post(baseURL + "/").send({ 
                idDoc: 1,
                coordinates: coordinates
            }).expect(401);

            expect(response.body.error).toBe('Unauthenticated user');
        });

        
        test('It should return 403 status if the user is not an urban planner', async () => {
            const cookie = await login(testResident);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            const response = await request(app).post(baseURL + "/").send({ 
                idDoc: 1,
                coordinates: coordinates
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
                    idDoc: 1,
                    coordinates: coordinate
                }).set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });
    });

    describe('GET /', () => {
        test('It should retrieves all documents with their coordinates and return 200 status', async () => {

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toStrictEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testDocCoordinate]);

        });

        test('It should return an empty array if there are no documents and return 200 status', async () => {

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
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

    
    describe('POST /update', () => {
        test('It should modify the coordinates of a document and return 200 status', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toStrictEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();
     
            const response = await request(app).post(baseURL + "/update")
                .send({
                    idDoc: 1,
                    coordinates: newCoordinate
                }).set("Cookie", cookie).expect(200);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Coordinates updated successfully" });

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should modify multiple coordinates of a document and return 200 status', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();
     
            const response = await request(app).post(baseURL + "/update")
                .send({
                    idDoc: 1,
                    coordinates: newCoordinates
                }).set("Cookie", cookie).expect(200);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Coordinates updated successfully" });

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the body is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await request(app).post(baseURL + "/update").send({}).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await request(app).post(baseURL + "/update")
                .send({
                    idDoc: "abc",
                    coordinates: newCoordinate
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if idDoc is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await request(app).post(baseURL + "/update")
                .send({
                    idDoc: null,
                    coordinates: newCoordinate
                }).set("Cookie", cookie).expect(422);
 
            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if coordinates is not LatLng', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await request(app).post(baseURL + "/update")
                .send({
                    idDoc: 1,
                    coordinates: "newCoordinate"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

        });

        test('It should return 422 status if at least on element of coordinates is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await request(app).post(baseURL + "/update")
                .send({
                    idDoc: 1,
                    coordinates: [{ lat: 40.0, lng: 45.0 }, { lat: "invalid", lng: 90.0 }],
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if coordinates is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await request(app).post(baseURL + "/update")
                .send({
                    idDoc: 1,
                    coordinates: null
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            const response = await request(app).post(baseURL + "/update").send({ 
                idDoc: 1,
                coordinates: newCoordinates
            }).expect(401);

            expect(response.body.error).toBe('Unauthenticated user');
        });

        
        test('It should return 403 status if the user is not an urban planner', async () => {
            const cookie = await login(testResident);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            const response = await request(app).post(baseURL + "/update").send({ 
                idDoc: 1,
                coordinates: newCoordinates
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

            const response = await request(app).post(baseURL + "/update")
                .send({
                    idDoc: 1,
                    coordinates: coordinate
                }).set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });
    });
});