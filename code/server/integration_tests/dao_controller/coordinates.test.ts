import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { CoordinatesController } from "../../src/controllers/coordinatesController"
import DocumentController from "../../src/controllers/documentController"
import Coordinate from '../../src/models/coordinate';
import { Document } from '../../src/models/document';
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
 
         const query = `INSERT INTO stakeholders (name, category) VALUES (?, ?)`;
         db.run(query, ["John", "urban developer"], function (err) {
             if (err) {
                 console.log("Stakeholder insertion error")
             }
         });

        jest.resetAllMocks();

      });

    const controller = new CoordinatesController();
    const documentController = new DocumentController();
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testCoordinate1 = new Coordinate(1, 1, 40.7128, -74.0060);
    const testCoordinate2 = new Coordinate(2, 1, -55.7128, 45.0060);
    const testCoordinate3 = new Coordinate(3, 2, 40.7128, -74.0060);
    const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };
    const coordinates: LatLng[] = [
        { lat: 40.7128, lng: -74.0060 },
        { lat: 34.0522, lng: -118.2437 },
      ];
    const newCoordinate: LatLng = { lat: -55.7128, lng: 45.0060 };
    const testDocument = new Document(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1]);
    const newTestDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate2]);
    const newTestDocCoordinate2 = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate2,testCoordinate3]);

    describe('setDocumentCoordinates', () => {

        test("It should successfully It should successfully set a coordinate for a document", async () => {
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();
        });

        test("It should successfully It should successfully set multiple coordinate for a document", async () => {
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

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

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toStrictEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocCoordinate]);

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

    describe('updateDocumentCoordinatess', () => {

        test("It should Modify the coordinates of a document", async () => {
            
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocCoordinate]);

            await expect(controller.updateDocumentCoordinates(1,newCoordinate)).resolves.toBeUndefined();

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([newTestDocCoordinate]);
        });

        test("It should Modify multiple coordinates of a document", async () => {
            
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocCoordinate]);

            await expect(controller.updateDocumentCoordinates(1,[newCoordinate,coordinate])).resolves.toBeUndefined();

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([newTestDocCoordinate2]);
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
});
