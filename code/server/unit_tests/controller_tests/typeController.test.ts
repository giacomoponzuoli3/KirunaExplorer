import { describe, afterEach, test, expect, jest } from "@jest/globals";
import { TypeDAO } from "../../src/dao/typeDAO"
import Type from "../../src/models/type"
import { TypeController } from "../../src/controllers/typeController";

jest.mock("../../src/dao/typeDAO");

describe('typeController', () => {
    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });


    const dao = TypeDAO.prototype;
    const controller = new TypeController();
    const testType = new Type(1, "Informative");

    describe('addTypes', () => {

        test('It should successfully add a type', async () => {
            jest.spyOn(dao, 'addType').mockResolvedValue(1);

            await expect(controller.addTypes("Informative")).resolves.toEqual(1);

            expect(dao.addType).toHaveBeenCalledWith("Informative");
        });

        test('It should reject if there is an error in type insertion', async () => { 
            jest.spyOn(dao, 'addType').mockRejectedValue(new Error("Scale insertion error"));

            await expect(controller.addTypes("Informative")).rejects.toThrow("Scale insertion error");

            expect(dao.addType).toHaveBeenCalledWith("Informative");
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(dao, 'addType').mockRejectedValue(new Error("Unexpected error"));

            await expect(controller.addTypes("Informative")).rejects.toThrow("Unexpected error");

            expect(dao.addType).toHaveBeenCalledWith("Informative");
        });

    });

    describe('getTypes', () => {

        test('It should successfully retrieve all the types', async () => {
            jest.spyOn(dao, 'getTypes').mockResolvedValue([testType]);

            await expect(controller.getTypes()).resolves.toEqual([testType]);

            expect(dao.getTypes).toHaveBeenCalled();
        });

        test('It should reject if there are no types', async () => { 
            jest.spyOn(dao, 'getTypes').mockRejectedValueOnce(TypeController);

            await expect(controller.getTypes()).rejects.toEqual(TypeController);

            expect(dao.getTypes).toHaveBeenCalled();
        });

        test('It should reject if there is a database error', async () => { 
            jest.spyOn(dao, 'getTypes').mockRejectedValue(new Error("Database Error"));

            await expect(controller.getTypes()).rejects.toThrow("Database Error");

            expect(dao.getTypes).toHaveBeenCalled();
        });

        test('It should reject if there is a generic error', async () => {
            jest.spyOn(dao, 'getTypes').mockRejectedValue(new Error("Unexpected Error"));

            await expect(controller.getTypes()).rejects.toThrow("Unexpected Error");

            expect(dao.getTypes).toHaveBeenCalled();
        });
    });

});