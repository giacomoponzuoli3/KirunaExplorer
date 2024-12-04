import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import { DocumentDAO } from "../../src/dao/documentDAO"
import DocumentController from "../../src/controllers/documentController"
import { LinkController } from "../../src/controllers/linkController"
import { Document } from "../../src/models/document"
import { Stakeholder } from "../../src/models/stakeholder"
import { DocLink } from "../../src/models/document_link"
import Link from "../../src/models/link"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";
import { DocumentNotFoundError } from "../../src/errors/document";
import Resources from "../../../common_models/original_resources";

describe('documentController/documentDAO Integration tests', () => {

    beforeAll(async () => {
        await setup();
    });

    afterAll(async () => {
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

        let query = `INSERT INTO stakeholders (name, category) VALUES (?, ?)`;
        db.run(query, ["John", "urban developer"], function (err) {
            if (err) {
                console.log("Stakeholder insertion error")
            }
        });

        query = `INSERT INTO stakeholders (name, category) VALUES (?, ?)`;
        db.run(query, ["Bob", "urban developer"], function (err) {
            if (err) {
                console.log("Stakeholder insertion error")
            }
        });

        query = `INSERT INTO links (name) VALUES (?)`;
        db.run(query, ["Update"], function (err) {
            if (err) {
                console.log("Link insertion error")
            }
        });

        jest.resetAllMocks();

    });

    const controller = new DocumentController();
    const linkController = new LinkController();
    const testId = 1;
    const testLink = new Link(1, "Update");
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testDocument = new Document(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
    const testNewDocument = new Document(testId, "new title", [testStakeholder2], "1:1", "2020-10-10", "Informative document", "Italian", "300", "new description");
    const testDocument2 = new Document(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2");
    const testDocLink = new DocLink(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", testLink);
    const mockResourceData =  Buffer.from("data", 'base64')
    const mockResources: Resources[] = [
        { id: 1, idDoc: 1, data: null, name: 'Resource 1', uploadTime: new Date() },
        { id: 2, idDoc: 1, data: null, name: 'Resource 2', uploadTime: new Date() },
    ];

    describe('addDocument', () => {
        test('It should successfully add a document', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

        });

        test('It should reject if there is an error in document insertion', async () => {

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Insertion error'), null);
                return {} as Database;
            });

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow('Insertion error');

            dbSpy.mockRestore();

        });

        test('It should reject if there is a database error', async () => {

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow('Database error');

            dbSpy.mockRestore();
        });
    });

    describe('getDocumentById', () => {

        test('It should successfully retrieve the document with the specified id', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.getDocumentById(testId)).resolves.toEqual(testDocument);

        });

        test('It should reject if there is no document with the specified id', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.getDocumentById(2)).rejects.toThrow(DocumentNotFoundError);

        });

        test('It should reject if there is a database error', async () => {

            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getDocumentById(2)).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

    });

    describe('getAllDocuments', () => {
        test('It should successfully retrieve all the documents', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.getAllDocuments()).resolves.toEqual([testDocument, testDocument2]);

        });

        test('It should reject if there is no documents', async () => {

            await expect(controller.getAllDocuments()).resolves.toEqual([]);

        });

        test('It should reject if there is a database error', async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getAllDocuments()).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

    });

    describe('deleteDocument', () => {
        test('It should successfully delete a document with the specified id', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.getAllDocuments()).resolves.toEqual([testDocument, testDocument2]);

            await expect(controller.deleteDocument(testId)).resolves.toBeUndefined();

            await expect(controller.getAllDocuments()).resolves.toEqual([testDocument2]);

        });

        test('It should reject if there is a database error', async () => {
            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.deleteDocument(testId)).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });
    });

    describe('editDocument', () => {
        test('It should successfully edit a document with the specified id and informations', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.getDocumentById(testId)).resolves.toEqual(testDocument);

            await expect(controller.editDocument(testId, "new title", [testStakeholder2], "1:1", "2020-10-10", "Informative document", "Italian", "300", "new description")).resolves.toEqual(testNewDocument);

            await expect(controller.getDocumentById(testId)).resolves.toEqual(testNewDocument);
        });

        test('It should reject if there is a database error', async () => {
            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.editDocument(testId, "new title", [testStakeholder2], "1:1", "2020-10-10", "Informative document", "Italian", "300", "new description")).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });
    });

    describe(' getDocumentLinksById', () => {

        test("It should retrieve all the DocLinks connected to a document with the specified id", async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await (linkController.addLink(1, 2, 1));

            await expect(controller.getDocumentLinksById(testId)).resolves.toEqual([testDocLink]);

        });

        test("It should reject if there are no links", async () => {

            await expect(controller.getDocumentLinksById(testId)).resolves.toEqual([]);

        });

        test("It should reject if there is a database error", async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getDocumentLinksById(testId)).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();


        });

    });

    describe(' getDocumentTitleById', () => {

        test("It should retrieve the title of a document with the specified id", async () => {
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.getDocumentTitleById(testId)).resolves.toEqual("title");
        });

        test("It should reject if there is a database error", async () => {
            const dbSpy = jest.spyOn(db, 'get').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getDocumentTitleById(testId)).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

        test("It should reject if there is no document with the specified id", async () => {

            await expect(controller.getDocumentTitleById(testId)).rejects.toThrow(DocumentNotFoundError);

        });

    });

    describe(' getDocumentDescriptionById', () => {

        test("It should retrieve the description of a document with the specified id", async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.getDocumentDescriptionById(testId)).resolves.toEqual("description");
        });

        test("It should reject if there is a database error", async () => {

            const dbSpy = jest.spyOn(db, 'get').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getDocumentDescriptionById(testId)).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

        test("It should reject if there is no document with the specified id", async () => {

            await expect(controller.getDocumentDescriptionById(testId)).rejects.toThrow(DocumentNotFoundError);

        });
    });


    describe(' getDocumentIssuanceDateById', () => {

        test("It should retrieve the IssuanceDate of a document with the specified id", async () => {
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.getDocumentIssuanceDateById(testId)).resolves.toEqual("2020-10-10");

        });

        test("It should reject if there is a database error", async () => {
            const dbSpy = jest.spyOn(db, 'get').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getDocumentIssuanceDateById(testId)).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

        test("It should reject if there is no document with the specified id", async () => {

            await expect(controller.getDocumentIssuanceDateById(testId)).rejects.toThrow(DocumentNotFoundError);

        });

    });

    describe(' getAllDocumentsOfSameType', () => {

        test("It should retrieve all the documents with the same type", async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.getAllDocumentsOfSameType("Informative document")).resolves.toEqual([testDocument, testDocument2]);

        });
        test("It should reject if there is a database error", async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getAllDocumentsOfSameType("Informative document")).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

        test("It should return an empty array if there are no documents with the specified type", async () => {

            await expect(controller.getAllDocumentsOfSameType("Material effect")).resolves.toEqual([]);

        });

    });

    describe(' addResourceToDocument', () => {

        test("It should adds a resource to the specified document in the database", async () => {
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addResourceToDocument(1, "title", "data")).resolves.toBeUndefined();

        });

        test("It should reject if there is a database error", async () => {
            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.addResourceToDocument(1, "title", "data")).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });


    });

    describe('getResourceData', () => {
        test('should return resource data when the DAO resolves successfully', async () => {

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addResourceToDocument(1, "title", "data")).resolves.toBeUndefined();

            await expect(controller.getResourceData(testId,1)).resolves.toEqual(mockResourceData);
        
        });

        test('should throw an error when the Document is not found', async () => {
            
            await expect(controller.getResourceData(testId, 1)).rejects.toThrow(DocumentNotFoundError);
           
        });

        test('should throw an Database error', async () => {
            const dbSpy = jest.spyOn(db, 'get').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getResourceData(testId,1)).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

    });

    describe('getAllResourcesData', () => {
        test('should return all resources when the DAO resolves successfully', async () => {
         
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addResourceToDocument(1, "Resource 1", "data")).resolves.toBeUndefined();

            await expect(controller.addResourceToDocument(1, "Resource 2", "data")).resolves.toBeUndefined();

            await expect(controller.getAllResourcesData(testId)).resolves.toEqual(mockResources);

        });

        test('should return an empty array when no resources are found', async () => {
           
            await expect(controller.getAllResourcesData(testId)).resolves.toEqual([]);

        });

        test("It should reject if there is a database error", async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getAllResourcesData(testId)).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });

    });

    describe('deleteResource', () => {
        test('should resolve when the DAO successfully deletes the resource', async () => {
            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.addResourceToDocument(1, "Resource 1", "data")).resolves.toBeUndefined();

            await expect(controller.deleteResource(1, "Resource 1")).resolves.toBeUndefined();

            await expect(controller.getAllResourcesData(testId)).resolves.toEqual([]);
        });

       
        test("It should reject if there is a database error", async () => {
            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.deleteResource(testId,"Resource 1")).rejects.toThrow(`Database error`);

            dbSpy.mockRestore();
        });
    });

});