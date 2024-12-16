import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import DocumentController from "../../src/controllers/documentController"
import { LinkController } from "../../src/controllers/linkController"
import { DocCoordinates } from "../../src/models/document_coordinate"
import { Stakeholder } from "../../src/models/stakeholder"
import Link from "../../src/models/link"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { cleanup } from "../../src/db/cleanup";
import { setup } from "../../src/db/setup";
import { LinkAlreadyExistsError, LinkNotFoundError } from "../../src/errors/link"

describe('linkController/linkDAO Integration tests', () => {

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
                        reject(err);
                    } else {
                        resolve(this);
                    }
                });
            });
        };
   
        await runAsync(`INSERT INTO stakeholders (name, category) VALUES (?, ?)`, ["John", "urban developer"]);
        await runAsync(`INSERT INTO stakeholders (name, category) VALUES (?, ?)`, ["Bob", "urban developer"]);
        await runAsync(`INSERT INTO links (name) VALUES (?)`, ["Update"]);
        await runAsync(`INSERT INTO links (name) VALUES (?)`, ["Connection"]);
    
        jest.resetAllMocks();
    });

    const documentController = new DocumentController();
    const controller = new LinkController();
    const testId = 1;
    const testLink = new Link(1, "Update");
    const testLink2 = new Link(2, "Connection");
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testDocument = new DocCoordinates(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description",[]);
    const testDocument2 = new DocCoordinates(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2",[]);

    describe("addLink", () => {
        test("It should successfully add a link", async () => {

            await expect(documentController.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(documentController.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.addLink(1, 2, 1)).resolves.toBeUndefined();

        });

        test("It should return an error if the link already exist add", async () => {

            await expect(documentController.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(documentController.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.addLink(1, 2, 1)).resolves.toBeUndefined();

            await expect(controller.addLink(1, 2, 1)).rejects.toThrow(LinkAlreadyExistsError);
        });


        test("It should handle errors from LinkDAO when adding a link", async () => {

            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error("Add link error"), null);
                return {} as Database;
            });

            await expect(controller.addLink(1, 2, 1)).rejects.toThrow("Add link error");

            dbSpy.mockRestore();
        });
    });

    describe("deleteLink", () => {
    
        test("It should successfully delete a link", async () => {

            await expect(documentController.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(documentController.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.addLink(1, 2, 1)).resolves.toBeUndefined();

            await expect(controller.deleteLink(1, 2, 1)).resolves.toBeUndefined();
        });

        test("It should handle errors from LinkDAO when deleting a link", async () => {

            const dbSpy = jest.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
                callback(new Error("Delete link error"), null);
                return {} as Database;
            });

            await expect(controller.deleteLink(1, 2, 1)).rejects.toThrow("Delete link error");

            dbSpy.mockRestore();
        });
    });

    describe("updateLink", () => {
        test("It should successfully update a link", async () => {

            await expect(documentController.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(documentController.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.addLink(1, 2, 1)).resolves.toBeUndefined();

            await expect(controller.updateLink(1, 2, 1, 2)).resolves.toBeUndefined();
         
        });

        test("It should return an error if the link already exist add", async () => {

            await expect(documentController.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(testDocument);

            await expect(documentController.addDocument("title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2")).resolves.toEqual(testDocument2);

            await expect(controller.addLink(1, 2, 1)).resolves.toBeUndefined();

            await expect(controller.updateLink(1, 2, 1, 1)).rejects.toThrow(LinkAlreadyExistsError);
        });

        test("It should handle errors from LinkDAO when updating a link", async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error("Update link error"), null);
                return {} as Database;
            });

            await expect(controller.updateLink(1, 2, 1, 2)).rejects.toThrow("Update link error");
            
            dbSpy.mockRestore();
        });
    });

    describe("getAllLinks", () => {
        test("It should return all links successfully", async () => {
    
            await expect(controller.getAllLinks()).resolves.toEqual([testLink,testLink2]);

        });

        test("It should return an error if there are no links", async () => {
            await cleanup();

            await expect(controller.getAllLinks()).rejects.toThrow(LinkNotFoundError);
        });

        test("It should handle errors from LinkDAO when retrieving all links", async () => {
            const dbSpy = jest.spyOn(db, 'all').mockImplementation(function (sql, params, callback) {
                callback(new Error("Get all links error"), null);
                return {} as Database;
            });

            await expect(controller.getAllLinks()).rejects.toThrow("Get all links error");
           
            dbSpy.mockRestore();
        });
    });

});