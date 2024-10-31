import { describe, afterEach, test, expect, jest } from "@jest/globals"
import {DocumentDAO} from "../../src/dao/documentDAO"
import db from "../../src/db/db"
import { Document } from "../../src/models/document"
import { Stakeholder } from "../../src/models/stakeholder"

import { Database } from "sqlite3";

jest.mock("../../src/db/db.ts");


describe('documentDAO', () => {

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const dao = new DocumentDAO();
    const testStakeholder1 = new Stakeholder(1,"John","urban developer");
    const testStakeholder2 = new Stakeholder(2,"John","urban developer");
    const testDocument = new Document(1,"title",[testStakeholder1,testStakeholder2],"1:1","2020-10-10","Informative document","English","300","description");
    const testId = 1;

    describe('addDocument', () => {
        test('It should successfully add a document', async () => {

            jest.spyOn(db, 'run')
            .mockImplementationOnce((sql, params, callback) => {
                callback.bind({  lastID: 1 })(null);  
                return {} as Database;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null); 
                return {} as Database;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null); 
                return {} as Database;
            });

            await expect(dao.addDocument("title",[1,2],"1:1","2020-10-10","Informative document","English","300","description")).resolves.toBeUndefined();
    
            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)',
                ["title","1:1","2020-10-10","Informative document","English","300","description"],
                expect.any(Function)
            );
            
            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 1],
                expect.any(Function)
            );
            
            expect(db.run).toHaveBeenNthCalledWith(
                3,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 2],
                expect.any(Function)
            );
        
        });

        test('It should reject if there is an error in document insertion', async () => {
            jest.spyOn(db, 'run')
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Document insertion error'));  
                return {} as Database;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null); 
                return {} as Database;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null); 
                return {} as Database;
            });

            await expect(dao.addDocument("title",[1,2],"1:1","2020-10-10","Informative document","English","300","description")).rejects.toThrow(`Document insertion error`);

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)',
                ["title","1:1","2020-10-10","Informative document","English","300","description"],
                expect.any(Function)
            );
            
        });

        test('It should reject if there is an error in first stakeholder insertion', async () => {
            jest.spyOn(db, 'run')
            .mockImplementationOnce((sql, params, callback) => {
                callback.bind({  lastID: 1 })(null);  
                return {} as Database;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error('First stakeholder insertion error'));
                return {} as Database;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null); 
                return {} as Database;
            });

            await expect(dao.addDocument("title",[1,2],"1:1","2020-10-10","Informative document","English","300","description")).rejects.toThrow(`First stakeholder insertion error`);

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)',
                ["title","1:1","2020-10-10","Informative document","English","300","description"],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 1],
                expect.any(Function)
            );
            
        });

        test('It should reject if there is an error in second stakeholder insertion', async () => {
            jest.spyOn(db, 'run')
            .mockImplementationOnce((sql, params, callback) => {
                callback.bind({  lastID: 1 })(null);  
                return {} as Database;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null); 
                return {} as Database;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Second stakeholder insertion error')); 
                return {} as Database;
            });

            await expect(dao.addDocument("title",[1,2],"1:1","2020-10-10","Informative document","English","300","description")).rejects.toThrow(`Second stakeholder insertion error`);

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)',
                ["title","1:1","2020-10-10","Informative document","English","300","description"],
                expect.any(Function)
            );
            
            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 1],
                expect.any(Function)
            );
            
            expect(db.run).toHaveBeenNthCalledWith(
                3,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 2],
                expect.any(Function)
            );
            
        });

        test('It should reject if there is a generic error', async () => {
 
            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                throw new Error('Unexpected error'); 
            });

            await expect(dao.addDocument("title", [1, 2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow(`Unexpected error`); 
        });
    });
});