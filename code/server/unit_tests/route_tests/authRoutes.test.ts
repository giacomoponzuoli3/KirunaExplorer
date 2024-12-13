import { describe, beforeEach, test, expect, jest } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import { User } from '../../../common_models/user';
import { app } from "../../index";
import request from 'supertest';
import Authenticator from "../../src/routers/auth"


const baseURL = "/kiruna/sessions"

jest.mock("../../src/controllers/userController.ts");
jest.mock("../../src/routers/auth");

describe('authRoutes', () => {

    const controller = UserController.prototype;
    const auth = Authenticator.prototype;
    const testUser = new User("urban_planner", "urban", "planner", "Urban Planner");

    beforeEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    describe('POST /register', () => {

        test('It should register a user and return 200 status', async () => {

            jest.spyOn(controller, "createUser").mockResolvedValueOnce(true);

            const response = await request(app).post(baseURL + '/register')
                .send({
                    username: "urban_planner",
                    name: "urban",
                    surname: "planner",
                    password: "admin",
                    role: "Urban Planner"
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "User registered successfully" });
            expect(controller.createUser).toHaveBeenCalledWith(
                "urban_planner",
                "urban",
                "planner",
                "admin",
                "Urban Planner"
            );
        });

        test('It should return 422 status if the body is missing', async () => {

            const response = await request(app).post(baseURL + "/register")
                .send({});
            expect(response.status).toBe(422);
            expect(controller.createUser).not.toHaveBeenCalled();
        });

        test('It should return 422 status if username is missing', async () => {

            const response = await request(app).post(baseURL + "/register")
                .send({
                    name: "urban",
                    surname: "planner",
                    password: "admin",
                    role: "Urban Planner"
                });
            expect(response.status).toBe(422);
            expect(controller.createUser).not.toHaveBeenCalled();
        });

        test('It should return 422 status if name is missing', async () => {

            const response = await request(app).post(baseURL + "/register")
                .send({
                    username: "urban_planner",
                    surname: "planner",
                    password: "admin",
                    role: "Urban Planner"
                });
            expect(response.status).toBe(422);
            expect(controller.createUser).not.toHaveBeenCalled();
        });

        test('It should return 422 status if surname is missing', async () => {

            const response = await request(app).post(baseURL + "/register")
                .send({
                    username: "urban_planner",
                    name: "urban",
                    password: "admin",
                    role: "Urban Planner"
                });
            expect(response.status).toBe(422);
            expect(controller.createUser).not.toHaveBeenCalled();
        });

        test('It should return 422 status if password is missing', async () => {

            const response = await request(app).post(baseURL + "/register")
                .send({
                    username: "urban_planner",
                    name: "urban",
                    surname: "planner",
                    role: "Urban Planner"
                });
            expect(response.status).toBe(422);
            expect(controller.createUser).not.toHaveBeenCalled();
        });

        test('It should return 422 status if role is missing', async () => {

            const response = await request(app).post(baseURL + "/register")
                .send({
                    username: "urban_planner",
                    name: "urban",
                    surname: "planner",
                    password: "admin"
                });
            expect(response.status).toBe(422);
            expect(controller.createUser).not.toHaveBeenCalled();
        });

        test('It should return 422 status if role is not "Resident" or "Urban Planner"', async () => {

            const response = await request(app).post(baseURL + "/register")
                .send({
                    username: "urban_planner",
                    name: "urban",
                    surname: "planner",
                    password: "admin",
                    role: "Visitor"
                });
            expect(response.status).toBe(422);
            expect(controller.createUser).not.toHaveBeenCalled();
        });

        test('It should return 503 if there is an error', async () => {

            jest.spyOn(controller, 'createUser').mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).post(baseURL + "/register")
                .send({
                    username: "urban_planner",
                    name: "urban",
                    surname: "planner",
                    password: "admin",
                    role: "Urban Planner"
                });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('POST /', () => {

        test('It should log in a user and return 200 status', async () => {

            jest.spyOn(auth, 'login').mockResolvedValueOnce(testUser);

            const response = await request(app).post(baseURL + '/')
                .send({
                    username: "urban_planner",
                    password: "admin"
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(testUser);

        });


        test('It should return 422 status if the body is missing', async () => {

            const response = await request(app).post(baseURL + '/')
                .send({});

            expect(response.status).toBe(422);

        });

        test('It should return 422 status if username is missing', async () => {

            const response = await request(app).post(baseURL + '/')
                .send({
                    password: "admin"
                });

            expect(response.status).toBe(422);

        });

        test('It should return 422 status if password is missing', async () => {

            const response = await request(app).post(baseURL + '/')
                .send({
                    username: "urban_planner"
                });

            expect(response.status).toBe(422);

        });

        test('It should return 401 status if username represents a non-existing user', async () => {

            jest.spyOn(auth, 'login').mockRejectedValue(new Error("Username represents a non-existing user"));

            const response = await request(app).post(baseURL + '/')
                .send({
                    username: "urban_planner",
                    password: "admin"
                });

            expect(response.status).toBe(401);

        });

        test('It should return 401 status if password is wrong', async () => {

            jest.spyOn(auth, 'login').mockRejectedValue(new Error("Wrong password"));

            const response = await request(app).post(baseURL + '/')
                .send({
                    username: "urban_planner",
                    password: "admin"
                });

            expect(response.status).toBe(401);

        });

    });


    describe('DELETE /current', () => {

        test('It should log out a user and return 200 status', async () => {

            jest.spyOn(auth, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testUser;
                return next();
            });

            jest.spyOn(auth, 'logout').mockResolvedValueOnce(null);

            const response = await request(app).delete(baseURL + '/current')
                .send({});

            expect(response.status).toBe(200);

        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(auth, 'logout').mockResolvedValueOnce(null);

            const response = await request(app).delete(baseURL + '/current')
                .send({});

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');

        });

        test('It should return 503 if there is an error', async () => {

            jest.spyOn(auth, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testUser;
                return next();
            });

            jest.spyOn(auth, 'logout').mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).delete(baseURL + '/current')
                .send({});

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');

        });

    });

    describe('GET /current', () => {

        test('It should retrieve the current user and return 200 status', async () => {

            jest.spyOn(auth, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testUser;
                return next();
            });


            const response = await request(app).get(baseURL + '/current')
                .send({});

            expect(response.status).toBe(200);
            expect(response.body).toEqual(testUser);

        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            const response = await request(app).get(baseURL + '/current')
                .send({});

            expect(response.status).toBe(401);

            expect(response.body.error).toBe('Unauthenticated user');

        });

    });

});
