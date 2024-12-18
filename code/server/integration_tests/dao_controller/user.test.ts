import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import { User } from "../../src/models/user";
import { UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/user";
import  UserController  from "../../src/controllers/userController";
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";

describe('userController/userDAO Integration tests', () => {

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

    const controller = new UserController();
    const testUser = new User("urban_planner", "urban", "planner", "Urban Planner");

    describe('createUser', () => {

        test('It should successfully add a user', async () => {

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);
        });

        test('it should reject with UserAlreadyExistsError when username is duplicate', async () => { 

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).rejects.toThrow(UserAlreadyExistsError);
        });

        test('it should reject with a generic error if database operation fails', async () => {

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error("Database error"), null);
                return {} as Database;
            });

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).rejects.toThrow("Database error");

            dbSpy.mockRestore();
        });

        test('it should reject with an error if crypto operation fails', async () => {

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Crypto error'), null);
                return {} as Database;
            });

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).rejects.toThrow("Crypto error");
            
            dbSpy.mockRestore();
        });

    });

    describe('getUserByUsername', () => {

        test('it should retrieve a user by the username', async () => {

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            await expect(controller.getUserByUsername("urban_planner")).resolves.toEqual(testUser);
        });

        test('it should reject with UserNotFoundError when the user is not found', async () => { 

            await expect(controller.getUserByUsername("urban_planner")).rejects.toThrow(UserNotFoundError);

        });

        test('It should reject if there is a database error', async () => { 

            const dbSpy = jest.spyOn(db, 'get').mockImplementation(function (sql, params, callback) {
                callback(new Error("Database Error"), null);
                return {} as Database;
            });

            await expect(controller.getUserByUsername("urban_planner")).rejects.toThrow("Database Error");
            
            dbSpy.mockRestore();
        });
    });

});