import { describe, afterAll, beforeAll, afterEach, test, expect, jest } from "@jest/globals"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { CoordinatesDAO } from "../../src/dao/coordinatesDAO"
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

    afterEach(async () => {
        await cleanup();
 
         const query = `INSERT INTO stakeholders (name, category) VALUES (?, ?)`;
         db.run(query, ["John", "urban developer"], function (err) {
             if (err) {
                 console.log("Insertion error")
             }
             console.log(this.lastID);
         });

        jest.resetAllMocks();

      });

    const dao = new CoordinatesDAO();
    const controller = new CoordinatesController();
    const documentController = new DocumentController();
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testCoordinate1 = new Coordinate(1, 5, 100, 200);
    const testCoordinate2 = new Coordinate(2, 10, 200, 100);
    const testCoordinate3 = new Coordinate(3, 1, 150, 150);
    const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };
    const testDocument = new Document(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1, testCoordinate2, testCoordinate3]);
    describe('setDocumentCoordinates', () => {

        test("It should successfully It should successfully set a coordinate for a document", async () => {
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();
        });

        test("It should successfully It should successfully set multiple coordinate for a document", async () => {
            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toBeUndefined();
        });
    });
    /**describe('getAllDocumentsCoordinates', () => {

        test("It should successfully retrieves all documents with their coordinates", async () => {

            await expect(documentController.addDocument("title", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toBe([testDocCoordinate]);

            await expect(controller.getAllDocumentsCoordinates()).resolves.toBe([testDocument]);

            await expect(controller.getAllDocumentsCoordinates()).resolves.toStrictEqual([testDocCoordinate]);

        });
    });**/

});
