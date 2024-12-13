import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { User } from "../../../common_models/user";
import { UserDAO } from "../../src/dao/userDAO"
import { UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/user";
import  UserController  from "../../src/controllers/userController";

jest.mock("../../src/dao/userDAO");

describe('stakeholderController', () => {
    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });


    const dao = UserDAO.prototype;
    const controller = new UserController();
    const testUser = new User("urban_planner", "urban", "planner", "Urban Planner");

    describe('createUser', () => {

        test('It should successfully add a user', async () => {
            jest.spyOn(dao, 'createUser').mockResolvedValue(true);

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).resolves.toBe(true);

            expect(dao.createUser).toHaveBeenCalledWith("urban_planner", "urban", "planner", "admin", "Urban Planner");
        });

        test('it should reject with UserAlreadyExistsError when username is duplicate', async () => { 
            jest.spyOn(dao, 'createUser').mockRejectedValue(new UserAlreadyExistsError);

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).rejects.toThrow(UserAlreadyExistsError);

            expect(dao.createUser).toHaveBeenCalledWith("urban_planner", "urban", "planner", "admin", "Urban Planner");
        });

        test('it should reject with a generic error if database operation fails', async () => {

            jest.spyOn(dao, 'createUser').mockRejectedValue(new Error("Database error"));

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).rejects.toThrow("Database error");

            expect(dao.createUser).toHaveBeenCalledWith("urban_planner", "urban", "planner", "admin", "Urban Planner");
        });

        test('it should reject with an error if crypto operation fails', async () => {

            jest.spyOn(dao, 'createUser').mockRejectedValue(new Error("Crypto error"));

            await expect(controller.createUser("urban_planner", "urban", "planner", "admin", "Urban Planner")).rejects.toThrow("Crypto error");

            expect(dao.createUser).toHaveBeenCalledWith("urban_planner", "urban", "planner", "admin", "Urban Planner");
        });

    });

    describe('getUserByUsername', () => {

        test('it should retrieve a user by the username', async () => {
            jest.spyOn(dao, 'getUserByUsername').mockResolvedValue(testUser);

            await expect(controller.getUserByUsername("urban_planner")).resolves.toEqual(testUser);

            expect(dao.getUserByUsername).toHaveBeenCalledWith("urban_planner");
        });

        test('it should reject with UserNotFoundError when the user is not found', async () => { 
            jest.spyOn(dao, 'getUserByUsername').mockRejectedValueOnce(UserNotFoundError);

            await expect(controller.getUserByUsername("urban_planner")).rejects.toEqual(UserNotFoundError);

            expect(dao.getUserByUsername).toHaveBeenCalledWith("urban_planner");
        });

        test('It should reject if there is a database error', async () => { 
            jest.spyOn(dao, 'getUserByUsername').mockRejectedValue(new Error("Database Error"));

            await expect(controller.getUserByUsername("urban_planner")).rejects.toThrow("Database Error");

            expect(dao.getUserByUsername).toHaveBeenCalledWith("urban_planner");
        });
    });

});