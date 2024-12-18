import { describe, afterEach, test, expect, jest } from "@jest/globals";
import  StakeholderController  from "../../src/controllers/stakeholderController";
import { app } from "../../index";
import request from 'supertest';
import Authenticator from "../../src/routers/auth";
import { User } from "../../src/models/user";
import { Stakeholder } from "../../src/models/stakeholder"
import {StakeholderNotFoundError} from "../../src/errors/stakeholder";

const baseURL = "/kiruna/stakeholders"

jest.mock("../../src/controllers/stakeholderController.ts");
jest.mock("../../src/routers/auth");

describe('stakeholders tests', () => {

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const controller =  StakeholderController.prototype;
    const testStakeholder = new Stakeholder(1, "John", "urban developer");
    const u = new User("urban_planner", "urban", "planner", "Urban Planner");

    describe('POST /', () => {
        test('It should register a stakeholder and return 201 status', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            jest.spyOn(controller, "addStakeholder").mockResolvedValueOnce(1);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "John",
                    category: "urban developer"
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ message: "Stakeholder added successfully" , id: 1});
            expect(controller.addStakeholder).toHaveBeenCalledWith(
                "John",
                "urban developer"
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
            expect(controller.addStakeholder).not.toHaveBeenCalled();
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
                    category: "urban developer"
                });
            expect(response.status).toBe(422);
            expect(controller.addStakeholder).not.toHaveBeenCalled();
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
                     category: "urban developer"
                });
            expect(response.status).toBe(422);
            expect(controller.addStakeholder).not.toHaveBeenCalled();
        });

        test('It should return 422 status if category is not a string', async () => {
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
                    name: "John",
                    category: 1
                });
            expect(response.status).toBe(422);
            expect(controller.addStakeholder).not.toHaveBeenCalled();
        });

        test('It should return 422 status if category is missing', async () => {
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
                    name: "John"
                });
            expect(response.status).toBe(422);
            expect(controller.addStakeholder).not.toHaveBeenCalled();
        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "addStakeholder").mockResolvedValueOnce(1);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "John",
                    category: "urban developer"
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

            jest.spyOn(controller, "addStakeholder").mockResolvedValueOnce(1);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "John",
                    category: "urban developer"
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
            
            jest.spyOn(controller, 'addStakeholder').mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const response = await request(app).post(baseURL + "/")
                .send({
                    name: "John",
                    category: "urban developer"
                });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    });

    describe('GET /', () => {

        test('It should retrieve all the stakeholders and return 200 status', async () => {
            jest.spyOn(controller, "getAllStakeholders").mockResolvedValueOnce([testStakeholder]);

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testStakeholder]);
            expect(controller.getAllStakeholders).toHaveBeenCalledWith();
        });

        test('It should return an error if there are no stakeholders', async () => {
            jest.spyOn(controller, "getAllStakeholders").mockRejectedValue(StakeholderNotFoundError);

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(503);
            expect(controller.getAllStakeholders).toHaveBeenCalledWith();
        });

        test('It should return 503 if there is an error', async () => {

            jest.spyOn(controller, "getAllStakeholders").mockImplementation(() => {
                throw new Error('Unexpected Error');
            });
    
            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    });

});