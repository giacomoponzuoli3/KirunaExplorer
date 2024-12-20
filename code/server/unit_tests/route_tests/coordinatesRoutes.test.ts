import { describe, beforeEach, test, expect, jest } from "@jest/globals"
import { CoordinatesController } from "../../src/controllers/coordinatesController"
import Coordinate from '../../src/models/coordinate';
import { LatLng } from '../../src/interfaces';
import { DocCoordinates } from '../../src/models/document_coordinate'
import { Stakeholder } from "../../src/models/stakeholder"
import { app } from "../../index";
import request from 'supertest';
import Authenticator from "../../src/routers/auth"
import { User } from '../../src/models/user';

const baseURL = "/kiruna/coordinates"

jest.mock("../../src/controllers/coordinatesController.ts");
jest.mock("../../src/routers/auth");

describe('coordinateRoutes', () => {

    beforeEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const testId = 1;
    const controller = CoordinatesController.prototype;
    const u = new User("urban_planner", "urban", "planner", "Urban Planner");
    const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };
    const coordinates: LatLng[] = [
        { lat: 40.7128, lng: -74.0060 },
        { lat: 34.0522, lng: -118.2437 },
    ];
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testCoordinate1 = new Coordinate(1, 5, 100, 200, 0);
    const testCoordinate2 = new Coordinate(2, 10, 200, 100, 0);
    const testCoordinate3 = new Coordinate(3, 1, 150, 150, 0);
    const testCoordinateMunicipalityArea = new Coordinate(4, null, null, null, 1);
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1, testCoordinate2, testCoordinate3]);
    const testDocCoordinateMunicipalityArea = new DocCoordinates(2, "title 2", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", [testCoordinateMunicipalityArea]);

    describe('GET /', () => {
        test('It should retrieves all documents with their coordinates and return 200 status', async () => {

            jest.spyOn(controller, "getAllDocumentsCoordinates").mockResolvedValueOnce([testDocCoordinate, testDocCoordinateMunicipalityArea]);

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testDocCoordinate, testDocCoordinateMunicipalityArea]);
            expect(controller.getAllDocumentsCoordinates).toHaveBeenCalledWith();
        });

        test('It should return an empty array if there are no documents and return 200 status', async () => {

            jest.spyOn(controller, "getAllDocumentsCoordinates").mockResolvedValueOnce([]);

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
            expect(controller.getAllDocumentsCoordinates).toHaveBeenCalledWith();
        });

        test('It should return 503 if there is an error', async () => {

            jest.spyOn(controller, "getAllDocumentsCoordinates").mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('POST /', () => {
        test('It should set a coordinate for a document and return 200 status', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            jest.spyOn(controller, "setDocumentCoordinates").mockResolvedValueOnce(undefined);

            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: coordinate
                })

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Coordinates added successfully" });
            expect(controller.setDocumentCoordinates).toHaveBeenCalledWith(1, coordinate);
        });

        test('It should set multiple coordinates for a document and return 200 status', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            jest.spyOn(controller, "setDocumentCoordinates").mockResolvedValueOnce(undefined);

            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: coordinates
                })

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Coordinates added successfully" });
            expect(controller.setDocumentCoordinates).toHaveBeenCalledWith(1, coordinates);
        });

        test('It should return 422 status if the body is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + "/")
                .send({});
            expect(response.status).toBe(422);
            expect(controller.setDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: "abc",
                    coordinates: coordinate
                })
            expect(response.status).toBe(422);
            expect(controller.setDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: null,
                    coordinates: coordinate
                })
            expect(response.status).toBe(422);
            expect(controller.setDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 422 status if coordinates is not LatLng', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: "coordinate"
                })
            expect(response.status).toBe(422);
            expect(controller.setDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 422 status if at least on element of coordinates is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: [{ lat: 40.0, lng: 45.0 }, { lat: "invalid", lng: 90.0 }],
                })
            expect(response.status).toBe(422);
            expect(controller.setDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 422 status if coordinates is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: null
                })
            expect(response.status).toBe(422);
            expect(controller.setDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "setDocumentCoordinates").mockResolvedValueOnce(undefined);

            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: coordinates
                })

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                return res.status(403).json({ error: "User is not an urban planner" });
            });

            jest.spyOn(controller, "setDocumentCoordinates").mockResolvedValueOnce(undefined);

            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: coordinates
                })

            expect(response.status).toBe(403);

            expect(response.body.error).toBe('User is not an urban planner');
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, 'setDocumentCoordinates').mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const response = await request(app).post(baseURL + "/")
                .send({
                    idDoc: 1,
                    coordinates: coordinate
                })

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('DELETE /:id', () => {
        test('It should delete the coordinates of a document with the specified id and return 200 status', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            jest.spyOn(controller, "deleteDocumentCoordinates").mockResolvedValueOnce(undefined);

            const response = await request(app).delete(baseURL + `/${testId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Document's coordinates deleted successfully" });
            expect(controller.deleteDocumentCoordinates).toHaveBeenCalledWith(`${testId}`);
        });


        test('It should return 422 status if the param is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).delete(baseURL + `/abc`);

            expect(response.status).toBe(422);
            expect(controller.deleteDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 422 status if the param is null', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).delete(baseURL + `/` + null);

            expect(response.status).toBe(422);
            expect(controller.deleteDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "deleteDocumentCoordinates").mockResolvedValueOnce(undefined);

            const response = await request(app).delete(baseURL + `/${testId}`);

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                return res.status(403).json({ error: "User is not an urban planner" });
            });

            jest.spyOn(controller, "deleteDocumentCoordinates").mockResolvedValueOnce(undefined);

            const response = await request(app).delete(baseURL + `/${testId}`);

            expect(response.status).toBe(403);

            expect(response.body.error).toBe('User is not an urban planner');
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "deleteDocumentCoordinates").mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const response = await request(app).delete(baseURL + `/${testId}`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('POST /update', () => {

        test('It should update document coordinates and return 200 status', async () => {
            // Mock the Authenticator methods to simulate a logged-in and authorized user
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u; // Simulate a logged-in user
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u; // Simulate a user with the "planner" role
                return next();
            });

            // Mock the controller method to simulate a successful update
            jest.spyOn(controller, "updateDocumentCoordinates").mockResolvedValueOnce(undefined);

            // Perform the request
            const response = await request(app).post(baseURL + "/update").send({
                idDoc: 1,            // Valid document ID
                coordinates: coordinate, // Valid coordinate
            });

            // Assertions
            expect(response.status).toBe(200); // Should return 200 OK
            expect(response.body).toEqual({ message: "Coordinates updated successfully" }); // Verify response message
            expect(controller.updateDocumentCoordinates).toHaveBeenCalledWith(1, coordinate); // Ensure correct arguments passed
        });

        test('It should return 422 status if the body is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).post(baseURL).send({});

            expect(response.status).toBe(422);
            expect(controller.updateDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).post(baseURL).send({
                idDoc: "abc",
                coordinates: coordinate,
            });

            expect(response.status).toBe(422);
            expect(controller.updateDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 422 status if coordinates is invalid', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).post(baseURL).send({
                idDoc: 1,
                coordinates: "invalid",
            });

            expect(response.status).toBe(422);
            console.log(response.body.error)
            expect(response.body).toEqual({
                error: 'The parameters are not formatted properly\n' +
                    '\n' +
                    '- Parameter: **coordinates** - Reason: *Invalid value* - Location: *body*\n' +
                    '\n'
            });
            //expect(response.body.error).toMatch(/Coordinates must be a LatLng object or an array of LatLng/);
            expect(controller.updateDocumentCoordinates).not.toHaveBeenCalled();

        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            // Mock the controller method to simulate a successful update
            jest.spyOn(controller, "updateDocumentCoordinates").mockResolvedValueOnce(undefined);

            // Perform the request
            const response = await request(app).post(baseURL + "/update").send({
                idDoc: 1,            // Valid document ID
                coordinates: coordinate, // Valid coordinate
                useMunicipalArea: 1 // Valid useMunicipalArea
            });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                return res.status(403).json({ error: "User is not an urban planner" });
            });

            // Mock the controller method to simulate a successful update
            jest.spyOn(controller, "updateDocumentCoordinates").mockResolvedValueOnce(undefined);

            // Perform the request
            const response = await request(app).post(baseURL + "/update").send({
                idDoc: 1,            // Valid document ID
                coordinates: coordinate, // Valid coordinate
                useMunicipalArea: 1 // Valid useMunicipalArea
            });

            expect(response.status).toBe(403);

            expect(response.body.error).toBe('User is not an urban planner');
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "updateDocumentCoordinates").mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const response = await request(app).post(baseURL).send({
                idDoc: 1,
                coordinates: coordinate,
            });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe("Internal Server Error");
        });

    });

    describe('GET /georeferences', () => {
        test('It should retrieves all the existing georeferences (points and polygons), expect the municipality_area and return 200 status', async () => {
     
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u; 
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u; 
                return next();
            });

            jest.spyOn(controller, "getExistingGeoreferences").mockResolvedValueOnce([[testCoordinate1]]);

            const response = await request(app).get(baseURL + "/georeferences");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([[testCoordinate1]]);
            expect(controller.getExistingGeoreferences).toHaveBeenCalledWith();
        });

        
        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });


            jest.spyOn(controller, "getExistingGeoreferences").mockResolvedValueOnce([[testCoordinate1]]);

            const response = await request(app).get(baseURL + "/georeferences");

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                return res.status(403).json({ error: "User is not an urban planner" });
            });

            jest.spyOn(controller, "getExistingGeoreferences").mockResolvedValueOnce([[testCoordinate1]]);

            const response = await request(app).get(baseURL + "/georeferences");

            expect(response.status).toBe(403);

            expect(response.body.error).toBe('User is not an urban planner');
        });

        test('It should return 503 if there is an error', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u; 
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u; 
                return next();
            });

            jest.spyOn(controller, "getExistingGeoreferences").mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const response = await request(app).get(baseURL + "/georeferences");

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

});
