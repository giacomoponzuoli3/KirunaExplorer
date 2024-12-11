import { describe, afterEach, test, expect, jest } from "@jest/globals";
import { ScaleDAO } from "../../src/dao/scaleDAO";
import Scale from "../../src/models/scale";
import {ScaleNotFoundError} from "../../src/errors/scale";
import { ScaleController } from "../../src/controllers/scaleController";

jest.mock("../../src/dao/scaleDAO");

describe('scaleController', () => {
    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });


    const dao = ScaleDAO.prototype;
    const controller = new ScaleController();
    const testScale = new Scale(1,"1:100");

    describe('addScale', () => {

        test('It should successfully add a scale', async () => {
            jest.spyOn(dao, 'addScale').mockResolvedValue(1);

            await expect(controller.addScale("1:100")).resolves.toEqual(1);

            expect(dao.addScale).toHaveBeenCalledWith("1:100");
        });

        test('It should reject if there is an error in scale insertion', async () => { 
            jest.spyOn(dao, 'addScale').mockRejectedValue(new Error("Scale insertion error"));

            await expect(controller.addScale("1:100")).rejects.toThrow("Scale insertion error");

            expect(dao.addScale).toHaveBeenCalledWith("1:100");
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(dao, 'addScale').mockRejectedValue(new Error("Unexpected error"));

            await expect(controller.addScale("1:100")).rejects.toThrow("Unexpected error");

            expect(dao.addScale).toHaveBeenCalledWith("1:100");
        });

    });

    describe('getScales', () => {

        test('It should successfully retrieve all the scales', async () => {
            jest.spyOn(dao, 'getScales').mockResolvedValue([testScale]);

            await expect(controller.getScales()).resolves.toEqual([testScale]);

            expect(dao.getScales).toHaveBeenCalled();
        });

        test('It should reject if there are no scales', async () => { 
            jest.spyOn(dao, 'getScales').mockRejectedValueOnce(ScaleNotFoundError);

            await expect(controller.getScales()).rejects.toEqual(ScaleNotFoundError);

            expect(dao.getScales).toHaveBeenCalled();
        });

        test('It should reject if there is a database error', async () => { 
            jest.spyOn(dao, 'getScales').mockRejectedValue(new Error("Database Error"));

            await expect(controller.getScales()).rejects.toThrow("Database Error");

            expect(dao.getScales).toHaveBeenCalled();
        });

        test('It should reject if there is a generic error', async () => {
            jest.spyOn(dao, 'getScales').mockRejectedValue(new Error("Unexpected Error"));

            await expect(controller.getScales()).rejects.toThrow("Unexpected Error");

            expect(dao.getScales).toHaveBeenCalled();
        });
    });

});