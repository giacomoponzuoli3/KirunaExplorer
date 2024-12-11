import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { StakeholderDAO } from "../../src/dao/stakeholderDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { Stakeholder } from "../../src/models/stakeholder"
import {StakeholderNotFoundError} from "../../src/errors/stakeholder";

describe('stakeholderDAO', () => {

    const dao = new StakeholderDAO();
    const testStakeholder = new Stakeholder(1, "John", "urban developer");

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    describe('addStakeholder', () => {

        test('It should successfully add a stakeholder', async () => {
            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback.bind({ lastID: 1 })(null);
                return {} as Database;
            });

            await expect(dao.addStakeholder("John", "urban developer")).resolves.toEqual(1);
            
            expect(db.run).toHaveBeenCalledWith(
                'INSERT INTO stakeholders(name, category) VALUES(?, ?)',
                ["John", "urban developer"],
                expect.any(Function)
            );
        });

        test('It should reject if there is an error in stakeholder insertion', async () => { 
            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(new Error('Scale insertion error'));
                return {} as Database;
            });

            await expect(dao.addStakeholder("John", "urban developer")).rejects.toThrow('Scale insertion error');
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                throw new Error('Unexpected error');
            });

            await expect(dao.addStakeholder("John", "urban developer")).rejects.toThrow(`Unexpected error`);
        });

    });

    describe('getAllStakeholders', () => {

        test('It should successfully retrieve all the stakeholders', async () => {
            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                callback(null, [{ id: 1, name: 'John', category: 'urban developer' }]);
                return {} as Database;
            });

            await expect(dao.getAllStakeholders()).resolves.toEqual([testStakeholder]);

            
            expect(db.all).toHaveBeenCalledWith(
                'SELECT * FROM stakeholders',
                [],
                expect.any(Function)
            );
        });

        test('It should reject if there are no stakeholders', async () => { 
            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                callback(null,[]);
                return {} as Database;
            });

            await expect(dao.getAllStakeholders()).rejects.toThrow(StakeholderNotFoundError);

            
            expect(db.all).toHaveBeenCalledWith(
                'SELECT * FROM stakeholders',
                [],
                expect.any(Function)
            );
        });

        test('It should reject if there is a database error', async () => { 
            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                callback(new Error('Database error'));
                return {} as Database;
            });

            await expect(dao.getAllStakeholders()).rejects.toThrow('Database error');
        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
                throw new Error('Unexpected error');
            });

            await expect(dao.getAllStakeholders()).rejects.toThrow(`Unexpected error`);
        });
    });
});