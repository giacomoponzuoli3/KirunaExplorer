import { describe, beforeEach, beforeAll, afterAll, test, expect, jest } from "@jest/globals";
import { Stakeholder } from "../../src/models/stakeholder"
import StakeholderController from "../../src/controllers/stakeholderController";
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";
import { app } from "../../index";
import request from 'supertest';
import { Role } from "../../../common_models/user"

const baseURL = "/kiruna/stakeholders"

describe('stakeholderRoutes/stakeholderController Integration Tests', () => {

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

        await runAsync(`INSERT INTO users (username, name, surname, role, password, salt) VALUES (?, ?, ?, ?, ?, ?)`,
            ["urban_planner", "urban", "planner", "Urban Planner", "84f2763be5408b77c05292178b08b4a3", "1f39956c7101ff188ce0a015786f0493"]);
        await runAsync(`INSERT INTO users (username, name, surname, role, password, salt) VALUES (?, ?, ?, ?, ?, ?)`,
            ["resident", "resident", "resident", "Resident", "84f2763be5408b77c05292178b08b4a3", "1f39956c7101ff188ce0a015786f0493"]);

        jest.resetAllMocks();
    });



    const controller = new StakeholderController();
    const testStakeholder = new Stakeholder(1, "John", "urban developer");
    const testUrbanPlanner = { username: "urban_planner", name: "urban", surname: "planner", password: "admin", role: Role.PLANNER };
    const testResident = { username: "resident", name: "resident", surname: "resident", password: "admin", role: Role.RESIDENT };

    describe('POST /', () => {
        test('It should register a stakeholder and return 201 status', async () => {

            const cookie = await login(testUrbanPlanner);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "John",
                    category: "urban developer"
                }).set("Cookie", cookie).expect(201);

            expect(response.body).toEqual({ message: "Stakeholder added successfully", id: 1 });

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if the body is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({}).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if name is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    name: 1,
                    category: "urban developer"
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if name is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    category: "urban developer"
                }).set("Cookie", cookie).expect(422);


            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if category is not a string', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    name: "john",
                    category: 1
                }).set("Cookie", cookie).expect(422);

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 422 status if category is missing', async () => {
            const cookie = await login(testUrbanPlanner);

            await request(app).post(baseURL + "/")
                .send({
                    name: "John"
                }).set("Cookie", cookie).expect(422);


            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);
        });

        test('It should return 401 status if the user is not logged in', async () => {

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "John",
                    category: "urban developer"
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {
            const cookie = await login(testResident);

            const response = await request(app).post(baseURL + '/')
                .send({
                    name: "John",
                    category: "urban developer"
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
                    name: "John",
                    category: "urban developer"
                }).set("Cookie", cookie).expect(503);

            expect(response.body.error).toBe('Internal Server Error');

            await request(app).delete("/kiruna/sessions/current").set("Cookie", cookie).expect(200);

            dbSpy.mockRestore();
        });

    });


    describe('GET /', () => {
        test('It should retrieve all the stakeholders and return 200 status', async () => {
            
            await expect(controller.addStakeholder("John", "urban developer")).resolves.toEqual(1);

            const response = await request(app).get(baseURL + "/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testStakeholder]);

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

});