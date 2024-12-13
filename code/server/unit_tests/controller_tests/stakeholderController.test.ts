import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { StakeholderDAO } from "../../src/dao/stakeholderDAO"
import { Stakeholder } from "../../src/models/stakeholder"
import { StakeholderNotFoundError } from "../../src/errors/stakeholder";
import  StakeholderController  from "../../src/controllers/stakeholderController";

jest.mock("../../src/dao/stakeholderDAO");

describe('stakeholderController', () => {
    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });


    const dao = StakeholderDAO.prototype;
    const controller = new StakeholderController();
    const testStakeholder = new Stakeholder(1, "John", "urban developer");

    describe('addStakeholder', () => {

        test('It should successfully add a stakeholder', async () => {
            jest.spyOn(dao, 'addStakeholder').mockResolvedValue(1);

            await expect(controller.addStakeholder("John", "urban developer")).resolves.toEqual(1);

            expect(dao.addStakeholder).toHaveBeenCalledWith("John", "urban developer");
        });

        test('It should reject if there is an error in stakeholder insertion', async () => { 
            jest.spyOn(dao, 'addStakeholder').mockRejectedValue(new Error("Scale insertion error"));

            await expect(controller.addStakeholder("John", "urban developer")).rejects.toThrow("Scale insertion error");

            expect(dao.addStakeholder).toHaveBeenCalledWith("John", "urban developer");
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(dao, 'addStakeholder').mockRejectedValue(new Error("Unexpected error"));

            await expect(controller.addStakeholder("John", "urban developer")).rejects.toThrow("Unexpected error");

            expect(dao.addStakeholder).toHaveBeenCalledWith("John", "urban developer");
        });

    });

    describe('getAllStakeholders', () => {

        test('It should successfully retrieve all the stakeholders', async () => {
            jest.spyOn(dao, 'getAllStakeholders').mockResolvedValue([testStakeholder]);

            await expect(controller.getAllStakeholders()).resolves.toEqual([testStakeholder]);

            expect(dao.getAllStakeholders).toHaveBeenCalled();
        });

        test('It should reject if there are no stakeholders', async () => { 
            jest.spyOn(dao, 'getAllStakeholders').mockRejectedValueOnce(StakeholderNotFoundError);

            await expect(controller.getAllStakeholders()).rejects.toEqual(StakeholderNotFoundError);

            expect(dao.getAllStakeholders).toHaveBeenCalled();
        });

        test('It should reject if there is a database error', async () => { 
            jest.spyOn(dao, 'getAllStakeholders').mockRejectedValue(new Error("Database Error"));

            await expect(controller.getAllStakeholders()).rejects.toThrow("Database Error");

            expect(dao.getAllStakeholders).toHaveBeenCalled();
        });

        test('It should reject if there is a generic error', async () => {
            jest.spyOn(dao, 'getAllStakeholders').mockRejectedValue(new Error("Unexpected Error"));

            await expect(controller.getAllStakeholders()).rejects.toThrow("Unexpected Error");

            expect(dao.getAllStakeholders).toHaveBeenCalled();
        });
    });

});