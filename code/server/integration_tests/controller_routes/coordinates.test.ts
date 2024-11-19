import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { CoordinatesDAO } from "../../src/dao/coordinatesDAO"
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
import Authenticator from "../../src/routers/auth"
import { User } from "../../src/models/user"
import {CoordinatesArrayError, CoordinatesTypeError} from "../../src/errors/coordinates";

const baseURL = "/kiruna/coordinates"

describe('coordinatesRoutes/coordinatesController Integration tests', () => {

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
 
         const query = `INSERT INTO stakeholders (name, category) VALUES (?, ?)`;
         db.run(query, ["John", "urban developer"], function (err) {
             if (err) {
                 console.log("Stakeholder insertion error")
             }
         });

        jest.resetAllMocks();

      });

    const dao = new CoordinatesDAO();
    const controller = new CoordinatesController();;
    const u = new User("urban_planner", "urban", "planner", "Urban Planner");
    const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };
    const coordinates: LatLng[] = [
        { lat: 40.7128, lng: -74.0060 },
        { lat: 34.0522, lng: -118.2437 },
    ];
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testCoordinate1 = new Coordinate(1, 5, 100, 200);
    const testCoordinate2 = new Coordinate(2, 10, 200, 100);
    const testCoordinate3 = new Coordinate(3, 1, 150, 150);
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1, testCoordinate2, testCoordinate3]);

    describe('POST /', () => {
        test('It should set a coordinate for a document and return 200 status', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
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
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
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
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL + "/")
                .send({});
            expect(response.status).toBe(422);
            expect(controller.setDocumentCoordinates).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
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
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
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
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
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
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
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
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
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

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });

            jest.spyOn(controller, 'setDocumentCoordinates').mockRejectedValueOnce(new Error('Internal Server Error'));
           
            const response = await request(app).post(baseURL+"/")
            .send({
                idDoc: 1,
                coordinates: coordinate
            })

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });
});