import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { CoordinatesController } from "../../src/controllers/coordinatesController"
import DocumentController from "../../src/controllers/documentController"
import Coordinate from '../../src/models/coordinate';
import { LatLng } from '../../src/interfaces';
import { DocCoordinates } from '../../src/models/document_coordinate'
import { Stakeholder } from "../../src/models/stakeholder"
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";
import { app } from "../../index";
import request from 'supertest';
import { Role } from "../../src/models/user"

const baseURL = "/kiruna/coordinates"

describe('coordinatesRoutes/coordinatesController Integration tests', () => {

    const testId = 1;
    const testUrbanPlanner = { username: "urban_planner", name: "urban", surname: "planner", password: "admin", role: Role.PLANNER };
    const testResident = { username: "resident", name: "resident", surname: "resident", password: "admin", role: Role.RESIDENT };
    const controller = new CoordinatesController();
    const documentController = new DocumentController();
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testCoordinate1 = new Coordinate(1, 1, 40.7128, -74.0060,0);
    const testCoordinateMunicipalityArea = new Coordinate (2,null,null,null,1);
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

    const testDocCoordinateMunicipalityArea = new DocCoordinates(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", [testCoordinateMunicipalityArea]);
    const testDocument = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description",[]);
    const testDocument2 = new DocCoordinates(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2",[]);
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1]);

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
        await runAsync(`INSERT INTO users (username, name, surname, role, password, salt) VALUES (?, ?, ?, ?, ?, ?)`, 
                       ["urban_planner", "urban", "planner", "Urban Planner", "84f2763be5408b77c05292178b08b4a3", "1f39956c7101ff188ce0a015786f0493"]);
        await runAsync(`INSERT INTO users (username, name, surname, role, password, salt) VALUES (?, ?, ?, ?, ?, ?)`, 
                       ["resident", "resident", "resident", "Resident", "84f2763be5408b77c05292178b08b4a3", "1f39956c7101ff188ce0a015786f0493"]);

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

            dbSpy.mockRestore();
        });
    });

    describe('GET /', () => {
        test('It should retrieves all documents with their coordinates and return 200 status', async () => {

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toStrictEqual(testDocument);

            await expect(documentController.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toStrictEqual(testDocument2);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await expect(controller.setDocumentCoordinates(2,[])).resolves.toBeUndefined();

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testDocCoordinateMunicipalityArea,testDocCoordinate]);

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

    describe('DELETE /:id', () => {
        test('It should delete the coordinates of a document with the specified id and return 200 status', async () => {
            const cookie = await login(testUrbanPlanner);

            const response = await request(app).delete(baseURL + `/${testId}`).set("Cookie", cookie).expect(200);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Document's coordinates deleted successfully" });

        });


        test('It should return 422 status if the param is not numeric', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + `/abc`).set("Cookie", cookie).expect(422);
        });

        test('It should return 422 status if the param is null', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).delete(baseURL + `/` + null).set("Cookie", cookie).expect(422);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).delete(baseURL + `/${testId}`);

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {
            const cookie = await login(testResident);

            const response = await request(app).delete(baseURL + `/${testId}`).set("Cookie", cookie).expect(403);

            expect(response.body.error).toBe('User is not an urban planner');
        });

        test('It should return 503 if there is an error', async () => {
            const cookie = await login(testUrbanPlanner);

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            })

            const response = await request(app).delete(baseURL + `/${testId}`).set("Cookie", cookie).expect(503);

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

    describe('GET /georeferences', () => {
        test('It should retrieves all the existing georeferences (points and polygons), expect the municipality_area and return 200 status', async () => {

            const cookie = await login(testUrbanPlanner);

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            const response = await request(app).get(baseURL + "/georeferences").set("Cookie", cookie).expect(200);

            expect(response.body).toEqual([[testCoordinate1]]);
         
            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        
        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).get(baseURL + "/georeferences")

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            const cookie = await login(testResident);

            const response = await request(app).get(baseURL + "/georeferences").set("Cookie", cookie).expect(403);

            expect(response.body.error).toBe('User is not an urban planner');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 503 if there is an error', async () => {

            const cookie = await login(testUrbanPlanner);

            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            const response = await request(app).get(baseURL + "/georeferences").set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });
    });
});