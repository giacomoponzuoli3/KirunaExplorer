import { describe, afterEach, test, expect, jest } from "@jest/globals"
import db from "../../src/db/db"
import { User } from "../../src/models/user";
import crypto from "crypto"
import { Database } from "sqlite3";
import { UserDAO } from "../../src/dao/userDAO"
import { UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/user";

describe('userDAO', () => {

    const dao = new UserDAO();
    const testUser = new User("urban_planner", "urban", "planner", "Urban Planner");

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    describe('createUser', () => {

        test(' it should resolve true when a user is created successfully', async () => {
            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });

            await expect(dao.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            expect(db.run).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining(["urban_planner", "urban", "planner", "Urban Planner", expect.any(Buffer), expect.any(Buffer)]),
                expect.any(Function)
            );
        });

        test('it should reject with UserAlreadyExistsError when username is duplicate', async () => {

            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(new UserAlreadyExistsError);
                return {} as Database;
            });

            await expect(dao.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).rejects.toThrow(UserAlreadyExistsError);

            expect(db.run).toHaveBeenCalled();
        });

        test('it should reject with a generic error if database operation fails', async () => {

            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(new Error('Database error'));
                return {} as Database;
            });

            await expect(dao.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).rejects.toThrow('Database error');

            expect(db.run).toHaveBeenCalled();
        });

        test('it should reject with an error if crypto operation fails', async () => {
            jest.spyOn(crypto, 'randomBytes').mockImplementation(() => {
                throw new Error('Crypto error');
            });

            await expect(dao.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).rejects.toThrow('Crypto error');

            expect(db.run).not.toHaveBeenCalled();
        });
    });

    describe('getIsUserAuthenticated', () => {
        test('it should resolve true when the user is authenticated successfully', async () => {
            const mockSalt = Buffer.from('randomSalt');
            const mockHashedPassword = crypto.scryptSync("admin", mockSalt, 16);
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, {
                    username: "urban_planner",
                    password: mockHashedPassword.toString('hex'),
                    salt: mockSalt,
                });
                return {} as Database;
            });

            await expect(dao.getIsUserAuthenticated("urban_planner", "admin")).resolves.toBe(true);

            expect(db.get).toHaveBeenCalledWith(
                expect.any(String),
                ["urban_planner"],
                expect.any(Function)
            );
        });

        test('it should resolve false when the user is not found', async () => {
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            });

            await expect(dao.getIsUserAuthenticated("urban_planner", "admin")).resolves.toBe(false);

            expect(db.get).toHaveBeenCalled();
        });

        test('it should resolve false when the password does not match', async () => {
            const mockSalt = Buffer.from('randomSalt');
            const mockHashedPassword = crypto.scryptSync('differentPassword', mockSalt, 16);
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, {
                    username: "urban_planner",
                    password: mockHashedPassword.toString('hex'),
                    salt: mockSalt,
                });
                return {} as Database;
            });

            await expect(dao.getIsUserAuthenticated("urban_planner", "admin")).resolves.toBe(false);
            expect(db.get).toHaveBeenCalled();
        });

        test('it should reject with an error if database operation fails', async () => {

            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(new Error('Database error'));
                return {} as Database;
            });

            await expect(dao.getIsUserAuthenticated("urban_planner", "admin")).rejects.toThrow('Database error');

            expect(db.get).toHaveBeenCalled();
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                throw new Error('Unexpected error');
            });

            await expect(dao.getIsUserAuthenticated("urban_planner", "admin")).rejects.toThrow('Unexpected error');

            expect(db.get).toHaveBeenCalled();
        });
    });

    describe('getUserByUsername', () => {
        test('it should resolve with the user object when the user is found', async () => {
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, testUser);
                return {} as Database;
            });

            await expect(dao.getUserByUsername("urban_planner")).resolves.toEqual(testUser);

            expect(db.get).toHaveBeenCalledWith(
                expect.any(String),
                ["urban_planner"],
                expect.any(Function)
            );
        });

        test('it should reject with UserNotFoundError when the user is not found', async () => {
     
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            });

            await expect(dao.getUserByUsername("urban_planner")).rejects.toThrow(UserNotFoundError);

            expect(db.get).toHaveBeenCalled();
        });

        test('it should reject with a generic error if database operation fails', async () => {

            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(new Error('Database error'));
                return {} as Database;
            });

            await expect(dao.getUserByUsername("urban_planner")).rejects.toThrow('Database error');

            expect(db.get).toHaveBeenCalled();
        });
    });

});