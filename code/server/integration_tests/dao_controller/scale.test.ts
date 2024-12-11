import { describe, beforeEach, beforeAll, afterAll, test, expect, jest } from "@jest/globals";
import Scale from "../../src/models/scale";
import {ScaleNotFoundError} from "../../src/errors/scale";
import { ScaleController } from "../../src/controllers/scaleController";
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";


describe('scaleController/scaleDAO Integration tests', () => {

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
    

    const controller = new ScaleController();
    const testScale = new Scale(1,"1:100");

    describe('addScale', () => {

        test('It should successfully add a scale', async () => {
           
            await expect(controller.addScale("1:100")).resolves.toEqual(1);

        });

        test('It should reject if there is an error in scale insertion', async () => { 
             const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.addScale("1:100")).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });


    });

    describe('getScales', () => {

        test('It should successfully retrieve all the scales', async () => {
   
            await expect(controller.addScale("1:100")).resolves.toEqual(1);

            await expect(controller.getScales()).resolves.toEqual([testScale]);

        });

        test('It should reject if there are no scales', async () => { 
          
            await expect(controller.getScales()).rejects.toThrow(ScaleNotFoundError);

        });

        test('It should reject if there is a database error', async () => { 
            
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getScales()).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

    });

});