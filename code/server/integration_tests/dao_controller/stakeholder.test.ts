import { describe, beforeEach, beforeAll, afterAll, test, expect, jest } from "@jest/globals";
import { Stakeholder } from "../../src/models/stakeholder"
import {StakeholderNotFoundError} from "../../src/errors/stakeholder";
import  StakeholderController  from "../../src/controllers/stakeholderController";
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";


describe('stakeholderController/stakeholderDAO Integration tests', () => {

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
    
    const controller = new StakeholderController();
    const testStakeholder = new Stakeholder(1, "John", "urban developer");

    describe('addStakeholder', () => {

        test('It should successfully add a stakeholder', async () => {
           
            await expect(controller.addStakeholder("John", "urban developer")).resolves.toEqual(1);

        });

        test('It should reject if there is an error in stakeholder insertion', async () => { 
             const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.addStakeholder("John", "urban developer")).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });


    });

    describe('getAllStakeholders', () => {

        test('It should successfully retrieve all the stakeholders', async () => {
   
            await expect(controller.addStakeholder("John", "urban developer")).resolves.toEqual(1);

            await expect(controller.getAllStakeholders()).resolves.toEqual([testStakeholder]);

        });

        test('It should reject if there are no stakeholders', async () => { 
          
            await expect(controller.getAllStakeholders()).rejects.toThrow(StakeholderNotFoundError);

        });

        test('It should reject if there is a database error', async () => { 
            
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getAllStakeholders()).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

    });

});