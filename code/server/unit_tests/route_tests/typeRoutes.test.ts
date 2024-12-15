import { describe, afterEach, test, expect, jest } from "@jest/globals";
import { TypeController } from "../../src/controllers/typeController";
import { app } from "../../index";
import request from 'supertest';
import Authenticator from "../../src/routers/auth";
import { User } from "../../../common_models/user";
import Type from "../../src/models/type";
import { TypeNotFoundError } from "../../src/errors/type";
import exp from "constants";

const baseURL = "/kiruna/type"

jest.mock("../../src/controllers/typeController.ts");
jest.mock("../../src/routers/auth");

describe('typeRoutes tests', () => {

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const controller = TypeController.prototype;
    const testType = new Type(1, "Informative");
    const u = new User("urban_planner", "urban", "planner", "Urban Planner");

    describe('POST /', () => {
        test('It should register a type and return 200 status', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            jest.spyOn(controller, "addTypes").mockResolvedValueOnce(1);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "Informative"
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Type added successfully" });
            expect(controller.addTypes).toHaveBeenCalledWith(
                "Informative"
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
            expect(controller.addTypes).not.toHaveBeenCalled();
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
            expect(response.body.error).toEqual("Invalid type name provided");
            expect(controller.addTypes).not.toHaveBeenCalled();
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
            expect(response.body.error).toEqual("Invalid type name provided");
            expect(controller.addTypes).not.toHaveBeenCalled();
        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "addTypes").mockResolvedValueOnce(1);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "Informative"
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

            jest.spyOn(controller, "addTypes").mockResolvedValueOnce(1);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "Informative"
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
            jest.spyOn(controller, 'addTypes').mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).post(baseURL + "/")
                .send({
                    name: "Informative"
                });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    });

    describe('GET /', () => {

        test('It should retrieve all the types and return 200 status', async () => {
            jest.spyOn(controller, "getTypes").mockResolvedValueOnce([testType]);

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testType]);
            expect(controller.getTypes).toHaveBeenCalledWith();
        });

        test('It should return an error if there are no types', async () => {
            jest.spyOn(controller, "getTypes").mockRejectedValue(TypeNotFoundError);

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(503);
            expect(controller.getTypes).toHaveBeenCalledWith();
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getTypes").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    });

});