import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import { User } from '../../src/models/user';
import { app } from "../../index";
import request from 'supertest';
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";
import { Role } from "../../src/models/user"


const baseURL = "/kiruna/sessions"

describe('authRoutes', () => {

    const controller = new UserController();
    const testUser = new User("urban_planner", "urban", "planner", "Urban Planner");
    const testUrbanPlanner = { username: "urban_planner", name: "urban", surname: "planner", password: "admin", role: Role.PLANNER };

    // Helper function that logs in a user and returns the cookie
    // Can be used to log in a user before the tests or in the tests
    const testLogin = async (userInfo: any) => {
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
        jest.resetAllMocks();
    });

    describe('POST /register', () => {

        test('It should register a user and return 200 status', async () => {

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
            ;
        });

        test('It should return 422 status if the body is missing', async () => {

            const response = await request(app).post(baseURL + "/register")
                .send({});
            expect(response.status).toBe(422);

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

        });

        test('It should return 503 if there is an error', async () => {

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

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

            dbSpy.mockRestore();
        });
    });

    describe('POST /', () => {

        test('It should log in a user and return 200 status', async () => {

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            const response = await request(app).post(baseURL + '/')
                .send({
                    username: "urban_planner",
                    password: "admin"
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(testUser);

        });


        test('It should return 422 status if the body is missing', async () => {

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            const response = await request(app).post(baseURL + '/')
                .send({});

            expect(response.status).toBe(422);

        });

        test('It should return 422 status if username is missing', async () => {

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            const response = await request(app).post(baseURL + '/')
                .send({
                    password: "admin"
                });

            expect(response.status).toBe(422);

        });

        test('It should return 422 status if password is missing', async () => {

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            const response = await request(app).post(baseURL + '/')
                .send({
                    username: "urban_planner"
                });

            expect(response.status).toBe(422);

        });

        test('It should return 401 status if username represents a non-existing user', async () => {

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            const response = await request(app).post(baseURL + '/')
                .send({
                    username: "resident",
                    password: "admin"
                });

            expect(response.status).toBe(401);

        });

        test('It should return 401 status if password is wrong', async () => {

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            const response = await request(app).post(baseURL + '/')
                .send({
                    username: "urban_planner",
                    password: "password"
                });

            expect(response.status).toBe(401);

        });

    });


    describe('DELETE /current', () => {

        test('It should log out a user and return 200 status', async () => {
            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            const cookie = await testLogin(testUrbanPlanner);

            await request(app).delete(baseURL + '/current')
                .send({}).set("Cookie", cookie).expect(200);

        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).delete(baseURL + '/current')
                .send({});

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');

        });

    });

    describe('GET /current', () => {

        test('It should retrieve the current user and return 200 status', async () => {

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            const cookie = await testLogin(testUrbanPlanner);

            const response = await request(app).get(baseURL + '/current')
                .send({}).set("Cookie", cookie).expect(200);

            expect(response.body).toEqual(testUser);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).get(baseURL + '/current')
                .send({});

            expect(response.status).toBe(401);

            expect(response.body.error).toBe('Unauthenticated user');

        });

    });

});
