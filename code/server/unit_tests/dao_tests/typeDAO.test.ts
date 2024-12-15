import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { TypeDAO } from "../../src/dao/typeDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import Type from "../../src/models/type"
import { TypeNotFoundError } from "../../src/errors/type";

describe('typeDAO', () => {

    const dao = new TypeDAO();
    const testType = new Type(1, "Informative");

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    describe('addType', () => {

        test('It should successfully add a type', async () => {
            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback.bind({ lastID: 1 })(null);
                return {} as Database;
            });

            await expect(dao.addType("Informative")).resolves.toEqual(1);

            expect(db.run).toHaveBeenCalledWith(
                "INSERT INTO types (name) VALUES (?)",
                ["Informative"],
                expect.any(Function)
            );
        });

        test('It should reject if there is an error in type insertion', async () => {
            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(new Error('Type insertion error'));
                return {} as Database;
            });

            await expect(dao.addType("Informative")).rejects.toThrow('Type insertion error');
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                throw new Error('Unexpected error');
            });

            await expect(dao.addType("Informative")).rejects.toThrow(`Unexpected error`);
        });

    });

    describe('getTypes', () => {

        test('It should successfully retrieve all the type', async () => {
            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                callback(null, [{ type_id: 1, name: 'Informative' }]);
                return {} as Database;
            });

            await expect(dao.getTypes()).resolves.toEqual([testType]);


            expect(db.all).toHaveBeenCalledWith(
                'SELECT * FROM types',
                [],
                expect.any(Function)
            );
        });

        test('It should reject if there are no types', async () => {
            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                callback(null, []);
                return {} as Database;
            });

            await expect(dao.getTypes()).rejects.toThrow(TypeNotFoundError);


            expect(db.all).toHaveBeenCalledWith(
                'SELECT * FROM types',
                [],
                expect.any(Function)
            );
        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                callback(new Error('Database error'));
                return {} as Database;
            });

            await expect(dao.getTypes()).rejects.toThrow('Database error');
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                throw new Error('Unexpected error');
            });

            await expect(dao.getTypes()).rejects.toThrow(`Unexpected error`);
        });
    });
});