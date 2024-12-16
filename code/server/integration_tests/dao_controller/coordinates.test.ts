import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { CoordinatesController } from "../../src/controllers/coordinatesController"
import DocumentController from "../../src/controllers/documentController"
import Coordinate from '../../src/models/coordinate';
import { LatLng } from '../../src/interfaces';
import { DocCoordinates } from '../../src/models/document_coordinate'
import { Stakeholder } from "../../src/models/stakeholder"
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";


describe('coordinatesController/coordinatesDAO Integration tests', () => {

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
    
        const runAsync = (query: string, params: string[]) => {
            return new Promise((resolve, reject) => {
                db.run(query, params, function (err) {
                    if (err) {
                        reject(new Error('Database insertion error: ' + err.message)); 
                    } else {
                        resolve(this); 
                    }
                });
            });
        };
    
        await runAsync(`INSERT INTO stakeholders (name, category) VALUES (?, ?)`, ["John", "urban developer"]);

        jest.resetAllMocks();
    });
    
    const controller = new CoordinatesController();
    const documentController = new DocumentController();
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testCoordinate1 = new Coordinate(1, 1, 40.7128, -74.0060,0);
    const testCoordinate2 = new Coordinate(2, 2, -55.7128, 45.0060,0);
    const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };
    const coordinates: LatLng[] = [
        { lat: 40.7128, lng: -74.0060 },
        { lat: -55.7128, lng: 45.0060 },
      ];
    const newCoordinate: LatLng = { lat: -55.7128, lng: 45.0060 };
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1]);
    const testDocCoordinates = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1,testCoordinate2]);
    const testDocNoCoordinate = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", []);

    describe('setDocumentCoordinates', () => {

        test("It should successfully It should successfully set a coordinate for a document", async () => {
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocNoCoordinate);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();
        });

        test('It should successfully set the municipality area for a document if no coordinates are provided', async () => {
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocNoCoordinate);

            await expect(controller.setDocumentCoordinates(1,[])).resolves.toBeUndefined();
        });

        test("It should successfully It should successfully set multiple coordinate for a document", async () => {
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocNoCoordinate);

            await expect(controller.setDocumentCoordinates(1,coordinates)).resolves.toBeUndefined();
        });

        test('It should reject if there is an error in the coordinate insertion', async () => {

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Insertion error'), null);
                return {} as Database;
            });

            await expect(controller.setDocumentCoordinates(1,coordinates)).rejects.toThrow('Insertion error');

            dbSpy.mockRestore();
        });

        test('It should reject if there is a databse error', async () => {

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.setDocumentCoordinates(1,coordinates)).rejects.toThrow('Database error');

            dbSpy.mockRestore();
        });

    });

    describe('getAllDocumentsCoordinates', () => {

        test("It should successfully retrieves all documents with their coordinates", async () => {

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toStrictEqual(testDocNoCoordinate);

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocNoCoordinate]);
    
        });

        test('It should resolve an empty array if there is no documents', async () => {

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([]);

        });

        test('It should reject if there is a database error', async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getAllDocumentsCoordinates()).rejects.toThrow('Database error');

            dbSpy.mockRestore();
        });

        test("It should reject with error if an unexpected error occurs", async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Unexpected error'), null);
                return {} as Database;
            });

            await expect(controller.getAllDocumentsCoordinates()).rejects.toThrow('Unexpected error');

            dbSpy.mockRestore();
        });
    });

    describe('deleteDocumentCoordinatesById', () => {

        test('It should successfully delete document coordinates by ID', async () => {
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toStrictEqual(testDocNoCoordinate);

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocNoCoordinate]);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocCoordinate]);
    
            await expect(controller.deleteDocumentCoordinates(1)).resolves.toBeUndefined();

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocNoCoordinate]);
        });

        test('It should reject if there is an error in deleting document coordinates', async () => {
            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.deleteDocumentCoordinates(1)).rejects.toThrow('Database error');

            dbSpy.mockRestore();
        });

        test('It should reject if there is an unexpected error', async () => {
            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Unexpected error'), null);
                return {} as Database;
            });

            await expect(controller.deleteDocumentCoordinates(1)).rejects.toThrow('Unexpected error');

            dbSpy.mockRestore();
        });
    });


    describe('updateDocumentCoordinates', () => {

        test("It should modify the coordinates of a document", async () => {
            
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toStrictEqual(testDocNoCoordinate);

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocNoCoordinate]);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocCoordinate]);
        });

        test("It should Modify multiple coordinates of a document", async () => {
            
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toStrictEqual(testDocNoCoordinate);

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocNoCoordinate]);

            await expect(controller.setDocumentCoordinates(1,coordinates)).resolves.toBeUndefined();

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocCoordinates]);
        });


        test('It should reject if there is a database error', async () => {
            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.updateDocumentCoordinates(1,[newCoordinate,coordinate])).rejects.toThrow('Database error');

            dbSpy.mockRestore();
        });

        test("It should reject with error if an unexpected error occurs", async () => {
            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error('Unexpected error'), null);
                return {} as Database;
            });

            await expect(controller.updateDocumentCoordinates(1,[newCoordinate,coordinate])).rejects.toThrow('Unexpected error');

            dbSpy.mockRestore();
        });
    });

    describe('getExistingGeoreferences', () => {
        test('it should successfully get all the existing georeferences (point)', async () => {
    
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocNoCoordinate);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await expect(controller.getExistingGeoreferences()).resolves.toEqual([[testCoordinate1]]);

        });

        test('it should successfully get all the existing georeferences (polygon)', async () => {

            const newTestCoordinate2 = new Coordinate(2, 2, -55.7128, 45.0060,0);
    
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocNoCoordinate);

            await expect(controller.setDocumentCoordinates(1,coordinates)).resolves.toBeUndefined();

            await expect(controller.getExistingGeoreferences()).resolves.toEqual([[testCoordinate1,newTestCoordinate2]]);

        });

        test('it should reject if there is a database error', async () => {
            
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Database error'), null);
                return {} as Database;
            });

            await expect(controller.getExistingGeoreferences()).rejects.toThrow('Database error');

            dbSpy.mockRestore();
            
        });

        test('it should reject if an unexpected error occurs', async () => {

            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error('Unexpected error'), null);
                return {} as Database;
            });

            await expect(controller.getExistingGeoreferences()).rejects.toThrow('Unexpected error');

            dbSpy.mockRestore();
        });
    });

});
