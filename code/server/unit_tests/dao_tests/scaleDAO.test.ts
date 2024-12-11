import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { ScaleDAO } from "../../src/dao/scaleDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import Scale from "../../src/models/scale"
import {ScaleNotFoundError} from "../../src/errors/scale";

describe('scaleDAO', () => {

    const dao = new ScaleDAO();
    const testScale = new Scale(1,"1:100");

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    describe('addScale', () => {

        test('It should successfully add a scale', async () => {
            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback.bind({ lastID: 1 })(null);
                return {} as Database;
            });

            await expect(dao.addScale("1:100")).resolves.toEqual(1);

            
            expect(db.run).toHaveBeenCalledWith(
                'INSERT INTO scales (name) VALUES (?)',
                ["1:100"],
                expect.any(Function)
            );
        });

        test('It should reject if there is an error in scale insertion', async () => { 
            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(new Error('Scale insertion error'));
                return {} as Database;
            });

            await expect(dao.addScale("1:100")).rejects.toThrow('Scale insertion error');
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                throw new Error('Unexpected error');
            });

            await expect(dao.addScale("1:100")).rejects.toThrow(`Unexpected error`);
        });

    });

    describe('getScales', () => {

        test('It should successfully retrieve all the scales', async () => {
            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                callback(null, [{ scale_id: 1, name: '1:100' }]);
                return {} as Database;
            });

            await expect(dao.getScales()).resolves.toEqual([testScale]);

            
            expect(db.all).toHaveBeenCalledWith(
                'SELECT * FROM scales',
                [],
                expect.any(Function)
            );
        });

        test('It should reject if there are no scales', async () => { 
            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                callback(null,[]);
                return {} as Database;
            });

            await expect(dao.getScales()).rejects.toThrow(ScaleNotFoundError);

            
            expect(db.all).toHaveBeenCalledWith(
                'SELECT * FROM scales',
                [],
                expect.any(Function)
            );
        });

        test('It should reject if there is a database error', async () => { 
            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                callback(new Error('Database error'));
                return {} as Database;
            });

            await expect(dao.getScales()).rejects.toThrow('Database error');
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                throw new Error('Unexpected error');
            });

            await expect(dao.getScales()).rejects.toThrow(`Unexpected error`);
        });
    });
});