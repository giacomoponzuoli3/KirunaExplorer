import { describe, beforeEach, beforeAll, afterAll, test, expect, jest } from "@jest/globals";
import Type from "../../src/models/type";
import { TypeNotFoundError } from "../../src/errors/type";
import { TypeController } from "../../src/controllers/typeController";
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";


describe('typeController/typeDAO Integration tests', () => {

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
    

    const controller = new TypeController();
    const testType = new Type(1,"Informative");

    describe('addTypes', () => {

        test('It should successfully add a type', async () => {
           
            await expect(controller.addTypes("Informative")).resolves.toEqual(1);

        });

        test('It should reject if there is an error in type insertion', async () => { 
             const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.addTypes("Informative")).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });


    });

    describe('getTypes', () => {

        test('It should successfully retrieve all the types', async () => {
   
            await expect(controller.addTypes("Informative")).resolves.toEqual(1);

            await expect(controller.getTypes()).resolves.toEqual([testType]);

        });

        test('It should reject if there are no types', async () => { 
          
            await expect(controller.getTypes()).rejects.toThrow(TypeNotFoundError);

        });

        test('It should reject if there is a database error', async () => { 
            
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getTypes()).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

    });

});