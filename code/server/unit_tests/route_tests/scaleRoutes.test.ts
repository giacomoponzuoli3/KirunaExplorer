import { describe, afterEach, test, expect, jest } from "@jest/globals";
import { ScaleController } from "../../src/controllers/scaleController";
import { app } from "../../index";
import request from 'supertest';
import Authenticator from "../../src/routers/auth";
import { User } from "../../../common_models/user";
import Scale from "../../src/models/scale";
import { ScaleNotFoundError } from "../../src/errors/scale";

const baseURL = "/kiruna/scale"

jest.mock("../../src/controllers/scaleController.ts");
jest.mock("../../src/routers/auth");

describe('scaleRoutes tests', () => {

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const controller = ScaleController.prototype;
    const testScale = new Scale(1, "1:100");
    const u = new User("urban_planner", "urban", "planner", "Urban Planner");

    describe('POST /', () => {
        test('It should register a scale and return 200 status', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            jest.spyOn(controller, "addScale").mockResolvedValueOnce(1);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "1:100"
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Scale added successfully" });
            expect(controller.addScale).toHaveBeenCalledWith(
                "1:100"
            );
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
            expect(controller.addScale).not.toHaveBeenCalled();
        });

        test('It should return 422 status if name is not a string', async () => {
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
                    name: 1,
                });
            expect(response.status).toBe(422);
            expect(controller.addScale).not.toHaveBeenCalled();
        });

        test('It should return 422 status if name is missing', async () => {
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
                    name: null
                });
            expect(response.status).toBe(422);
            expect(controller.addScale).not.toHaveBeenCalled();
        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "addScale").mockResolvedValueOnce(1);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "1:100"
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

            jest.spyOn(controller, "addScale").mockResolvedValueOnce(1);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "1:100"
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
            
            jest.spyOn(controller, 'addScale').mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const response = await request(app).post(baseURL + "/")
                .send({
                    name: "1:100"
                });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    });

    describe('GET /', () => {

        test('It should retrieve all the scales and return 200 status', async () => {
            jest.spyOn(controller, "getScales").mockResolvedValueOnce([testScale]);

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testScale]);
            expect(controller.getScales).toHaveBeenCalledWith();
        });

        test('It should return an error if there are no scales', async () => {
            jest.spyOn(controller, "getScales").mockRejectedValue(ScaleNotFoundError);

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(503);
            expect(controller.getScales).toHaveBeenCalledWith();
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getScales").mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    });

});