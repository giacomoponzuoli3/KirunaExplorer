import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { DocumentDAO } from "../../src/dao/documentDAO"
import DocumentController from "../../src/controllers/documentController"
import { Document } from "../../src/models/document"
import { Stakeholder } from "../../src/models/stakeholder"
import { DocLink } from "../../src/models/document_link"
import Link from "../../src/models/link"

jest.mock("../../src/dao/documentDAO");

describe('documentController', () => {
    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const dao = DocumentDAO.prototype;
    const controller = new DocumentController();
    const testId = 1;
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testDocument = new Document(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
    const testDocument2 = new Document(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2");
    const testDocument3 = new Document(3, "title 3", [testStakeholder2], "1:1", "2020-10-10", "Material effect", "English", "300", "description 3");

    describe('addDocument', () => {
        test('It should successfully add a document', async () => {

            jest.spyOn(dao, 'addDocument').mockResolvedValue(testDocument)

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toBe(
                testDocument
            );
            expect(dao.addDocument).toHaveBeenCalledWith("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");

        });

        test('It should reject if there is an error in document insertion', async () => {

            jest.spyOn(dao, 'addDocument').mockRejectedValue('Document insertion error');

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toEqual('Document insertion error');
            expect(dao.addDocument).toHaveBeenCalledWith("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
        });

        test('It should reject if there is an error in first stakeholder insertion', async () => {

            jest.spyOn(dao, 'addDocument').mockRejectedValue('First stakeholder insertion error');

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toEqual('First stakeholder insertion error');
            expect(dao.addDocument).toHaveBeenCalledWith("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");

        });

        test('It should reject if there is an error in second stakeholder insertion', async () => {

            jest.spyOn(dao, 'addDocument').mockRejectedValue('Second stakeholder insertion error');

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toEqual('Second stakeholder insertion error');
            expect(dao.addDocument).toHaveBeenCalledWith("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");

        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(dao, 'addDocument').mockRejectedValue('Unexpected error');

            await expect(controller.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toEqual(`Unexpected error`);
            expect(dao.addDocument).toHaveBeenCalledWith("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");

        });
    });

    describe('getDocumentById', () => {

        test('It should successfully retrieve the document with the specified id', async () => {
          
            jest.spyOn(dao, 'getDocumentById').mockResolvedValue(testDocument);

            await expect(controller.getDocumentById(testId)).resolves.toEqual(testDocument);
            expect(dao.getDocumentById).toHaveBeenCalledWith(testId);

        });

        test('It should reject if there is no document with the specified id', async () => {

            jest.spyOn(dao, 'getDocumentById').mockRejectedValue(`Document not found.`);

            await expect(controller.getDocumentById(testId)).rejects.toEqual(`Document not found.`);
            expect(dao.getDocumentById).toHaveBeenCalledWith(testId);

        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(dao, 'getDocumentById').mockRejectedValue(`Database error`);

            await expect(controller.getDocumentById(testId)).rejects.toEqual(`Database error`);
            expect(dao.getDocumentById).toHaveBeenCalledWith(testId);
        });

        test('It should reject with error if an unexpected error occurs', async () => {
            jest.spyOn(dao, 'getDocumentById').mockRejectedValue("Unexpected error");

            await expect(controller.getDocumentById(testId)).rejects.toEqual("Unexpected error");
            expect(dao.getDocumentById).toHaveBeenCalledWith(testId);
        });

    });

    describe('getAllDocuments', () => {
        test('It should successfully retrieve all the documents', async () => {
          
            jest.spyOn(dao, 'getAllDocuments').mockResolvedValue([testDocument])
            await expect(controller.getAllDocuments()).resolves.toEqual([testDocument]);

            expect(dao.getAllDocuments).toBeCalledWith();

        });

        test('It should return an empty array if there is no documents', async () => {
            jest.spyOn(dao, 'getAllDocuments').mockResolvedValue([])
            await expect(controller.getAllDocuments()).resolves.toEqual([]);

            expect(dao.getAllDocuments).toBeCalledWith();
        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(dao, 'getAllDocuments').mockRejectedValue(`Database error`)
            await expect(controller.getAllDocuments()).rejects.toEqual(`Database error`);

            expect(dao.getAllDocuments).toBeCalledWith();
        });

        test("It should reject with error if an unexpected error occurs", async () => {
            jest.spyOn(dao, 'getAllDocuments').mockRejectedValue("Unexpected error")
            await expect(controller.getAllDocuments()).rejects.toEqual("Unexpected error");

            expect(dao.getAllDocuments).toBeCalledWith();
        });
    });

    describe('deleteDocument', () => {
        test('It should successfully delete a document with the specified id', async () => {
            jest.spyOn(dao, 'deleteDocument').mockResolvedValue(undefined);

            await expect(controller.deleteDocument(testId)).resolves.toBeUndefined();
            expect(dao.deleteDocument).toBeCalledWith(testId);
        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(dao, 'deleteDocument').mockRejectedValue(`Database error`);

            await expect(controller.deleteDocument(testId)).rejects.toEqual(`Database error`);
            expect(dao.deleteDocument).toBeCalledWith(testId);
        });

        test("It should reject with error if an unexpected error occurs", async () => {
            jest.spyOn(dao, 'deleteDocument').mockRejectedValue("Unexpected error");

            await expect(controller.deleteDocument(testId)).rejects.toEqual("Unexpected error");
            expect(dao.deleteDocument).toBeCalledWith(testId);

        });
    });

    describe('editDocument', () => {
        test('It should successfully edit a document with the specified id and informations', async () => {

            jest.spyOn(dao, 'editDocument').mockResolvedValue(testDocument);;

            await expect(controller.editDocument(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toBe(
                testDocument
            );
            expect(dao.editDocument).toBeCalledWith(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");

        });

        test('It should reject if there is an error in document update', async () => {
            jest.spyOn(dao, 'editDocument').mockRejectedValue("Update Error");

            await expect(controller.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toEqual("Update Error");
            expect(dao.editDocument).toBeCalledWith(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "");
            
        });

        test('It should reject if there is an error in document delete', async () => {
            jest.spyOn(dao, 'editDocument').mockRejectedValue("Delete Error");

            await expect(controller.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toEqual("Delete Error");
            expect(dao.editDocument).toBeCalledWith(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "");

        });

        test('It should reject if there is an error in first stakeholder insertion', async () => {
            jest.spyOn(dao, 'editDocument').mockRejectedValue('First stakeholder insertion error');

            await expect(controller.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toEqual('First stakeholder insertion error');
            expect(dao.editDocument).toBeCalledWith(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "");
        });

        test('It should reject if there is an error in second stakeholder insertion', async () => {
            jest.spyOn(dao, 'editDocument').mockRejectedValue('Second stakeholder insertion error');

            await expect(controller.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toEqual('Second stakeholder insertion error');
            expect(dao.editDocument).toBeCalledWith(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "");
        });

        test("It should reject with error if an unexpected error occurs", async () => {
            jest.spyOn(dao, 'editDocument').mockRejectedValue("Unexpected error");

            await expect(controller.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toEqual("Unexpected error");
            expect(dao.editDocument).toBeCalledWith(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "");

        });
    });

    describe(' getDocumentLinksById', () => {

        test("It should retrieve all the DocLinks connected to a document with the specified id", async () => {

            jest.spyOn(dao, 'getDocumentLinksById').mockResolvedValue([
                new DocLink(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", new Link(1, "Link A")),
                new DocLink(3, "title 3", [testStakeholder2], "1:1", "2020-10-10", "Material effect", "English", "300", "description 3", new Link(2, "Link B"))
            ]);

            await expect(controller.getDocumentLinksById(testId)).resolves.toEqual([
                new DocLink(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", new Link(1, "Link A")),
                new DocLink(3, "title 3", [testStakeholder2], "1:1", "2020-10-10", "Material effect", "English", "300", "description 3", new Link(2, "Link B"))
            ])

            expect(dao.getDocumentLinksById).toBeCalledWith(testId);
        });

        test("It should reject if there is a link error", async () => {

            jest.spyOn(dao, 'getDocumentLinksById').mockRejectedValue("Link Error");

            await expect(controller.getDocumentLinksById(testId)).rejects.toEqual("Link Error");
            expect(dao.getDocumentLinksById).toBeCalledWith(testId);

        });

        test("It should reject if there are no links", async () => {

            jest.spyOn(dao, 'getDocumentLinksById').mockRejectedValue("No links found.");

            await expect(controller.getDocumentLinksById(testId)).rejects.toEqual("No links found.");
            expect(dao.getDocumentLinksById).toBeCalledWith(testId);
        
        });

        test("It should reject if there is a first document error", async () => {
            jest.spyOn(dao, 'getDocumentLinksById').mockRejectedValue("First Document Error");

            await expect(controller.getDocumentLinksById(testId)).rejects.toEqual("First Document Error");
            expect(dao.getDocumentLinksById).toBeCalledWith(testId);
        
        });

        test("It should reject if there is a second document error", async () => {
            jest.spyOn(dao, 'getDocumentLinksById').mockRejectedValue("Second Document Error");

            await expect(controller.getDocumentLinksById(testId)).rejects.toEqual("Second Document Error");
            expect(dao.getDocumentLinksById).toBeCalledWith(testId);
            
        });

        test("It should return an empty array if there is a no document", async () => {
            jest.spyOn(dao, 'getDocumentLinksById').mockResolvedValue([]);

            await expect(controller.getDocumentLinksById(testId)).resolves.toEqual([]);
            expect(dao.getDocumentLinksById).toBeCalledWith(testId);

        });

        test('It should reject if there is a first stakeholder error', async () => {
            jest.spyOn(dao, 'getDocumentLinksById').mockRejectedValue("First Stakeholder Error");

            await expect(controller.getDocumentLinksById(testId)).rejects.toEqual("First Stakeholder Error");
            expect(dao.getDocumentLinksById).toBeCalledWith(testId);
        
        });

        test('It should reject if there is a second stakeholder error', async () => {
            jest.spyOn(dao, 'getDocumentLinksById').mockRejectedValue("Second Stakeholder Error");

            await expect(controller.getDocumentLinksById(testId)).rejects.toEqual("Second Stakeholder Error");
            expect(dao.getDocumentLinksById).toBeCalledWith(testId);
           
        });

        test("It should reject with error if an unexpected error occurs", async () => {
            jest.spyOn(dao, 'getDocumentLinksById').mockRejectedValue("Unexpected error");

            await expect(controller.getDocumentLinksById(testId)).rejects.toEqual("Unexpected error");
            expect(dao.getDocumentLinksById).toBeCalledWith(testId);

        });

    });

    describe(' getDocumentTitleById', () => {

        test("It should retrieve the title of a document with the specified id", async () => {
            jest.spyOn(dao, 'getDocumentTitleById').mockResolvedValue("title");

            await expect(controller.getDocumentTitleById(testId)).resolves.toEqual("title");
            expect(dao.getDocumentTitleById).toBeCalledWith(testId);

        });

        test("It should reject if there is an error with select", async () => {
            jest.spyOn(dao, 'getDocumentTitleById').mockRejectedValue("Select Error");

            await expect(controller.getDocumentTitleById(testId)).rejects.toEqual("Select Error");
            expect(dao.getDocumentTitleById).toBeCalledWith(testId);

        });

        test("It should reject if there is no document with the specified id", async () => {
            jest.spyOn(dao, 'getDocumentTitleById').mockRejectedValue("Document not found.");

            await expect(controller.getDocumentTitleById(testId)).rejects.toEqual("Document not found.");
            expect(dao.getDocumentTitleById).toBeCalledWith(testId);
    
        });

        test("It should reject with error if an unexpected error occurs", async () => {
            jest.spyOn(dao, 'getDocumentTitleById').mockRejectedValue("Unexpected error");

            await expect(controller.getDocumentTitleById(testId)).rejects.toEqual("Unexpected error");
            expect(dao.getDocumentTitleById).toBeCalledWith(testId);

        });
    });

    describe(' getDocumentDescriptionById', () => {

        test("It should retrieve the description of a document with the specified id", async () => {
            jest.spyOn(dao, 'getDocumentDescriptionById').mockResolvedValue("description");

            await expect(controller.getDocumentDescriptionById(testId)).resolves.toEqual("description");
            expect(dao.getDocumentDescriptionById).toBeCalledWith(testId);
            
        });

        test("It should reject if there is an error with select", async () => {
            jest.spyOn(dao, 'getDocumentDescriptionById').mockRejectedValue("Select Error");

            await expect(controller.getDocumentDescriptionById(testId)).rejects.toEqual("Select Error");
            expect(dao.getDocumentDescriptionById).toBeCalledWith(testId);

        });

        test("It should reject if there is no document with the specified id", async () => {
            jest.spyOn(dao, 'getDocumentDescriptionById').mockRejectedValue("Document not found.");

            await expect(controller.getDocumentDescriptionById(testId)).rejects.toEqual("Document not found.");
            expect(dao.getDocumentDescriptionById).toBeCalledWith(testId);

        });

        test("It should reject with error if an unexpected error occurs", async () => {
            jest.spyOn(dao, 'getDocumentDescriptionById').mockRejectedValue("Unexpected error");

            await expect(controller.getDocumentDescriptionById(testId)).rejects.toEqual("Unexpected error");
            expect(dao.getDocumentDescriptionById).toBeCalledWith(testId);
        });
    });
    
    describe(' getDocumentIssuanceDateById', () => {

        test("It should retrieve the IssuanceDate of a document with the specified id", async () => {
            jest.spyOn(dao, 'getDocumentIssuanceDateById').mockResolvedValue("issuanceDate")

            await expect(controller.getDocumentIssuanceDateById(testId)).resolves.toEqual("issuanceDate");
            expect(dao.getDocumentIssuanceDateById).toBeCalledWith(testId);
        });

        test("It should reject if there is an error with select", async () => {
            jest.spyOn(dao, 'getDocumentIssuanceDateById').mockRejectedValue("Select Error")

            await expect(controller.getDocumentIssuanceDateById(testId)).rejects.toEqual("Select Error");
            expect(dao.getDocumentIssuanceDateById).toBeCalledWith(testId);
        
        });

        test("It should reject if there is no document with the specified id", async () => {
            jest.spyOn(dao, 'getDocumentIssuanceDateById').mockRejectedValue("Document not found.")

            await expect(controller.getDocumentIssuanceDateById(testId)).rejects.toEqual("Document not found.");
            expect(dao.getDocumentIssuanceDateById).toBeCalledWith(testId);

        });

        test("It should reject with error if an unexpected error occurs", async () => {
            jest.spyOn(dao, 'getDocumentIssuanceDateById').mockRejectedValue("Unexpected error")

            await expect(controller.getDocumentIssuanceDateById(testId)).rejects.toEqual("Unexpected error");
            expect(dao.getDocumentIssuanceDateById).toBeCalledWith(testId);
         
        });
    });

    describe(' getAllDocumentsOfSameType', () => {

        test("It should retrieve all the documents with the same type", async () => {

            jest.spyOn(dao, 'getAllDocumentsOfSameType').mockResolvedValue([testDocument3])

            await expect(controller.getAllDocumentsOfSameType("Material effect")).resolves.toEqual([testDocument3]);
            expect(dao.getAllDocumentsOfSameType).toBeCalledWith("Material effect");

        });

        test("It should reject if there is an error with select", async () => {
            jest.spyOn(dao, 'getAllDocumentsOfSameType').mockRejectedValue("Select Error")

            await expect(controller.getAllDocumentsOfSameType("Material effect")).rejects.toEqual("Select Error");
            expect(dao.getAllDocumentsOfSameType).toBeCalledWith("Material effect");

        });

        test("It should reject if there are no documents with the specified type", async () => {
            jest.spyOn(dao, 'getAllDocumentsOfSameType').mockRejectedValue("No documents found.")

            await expect(controller.getAllDocumentsOfSameType("Material effect")).rejects.toEqual("No documents found.");
            expect(dao.getAllDocumentsOfSameType).toBeCalledWith("Material effect");

        });

        test("It should reject with error if an unexpected error occurs", async () => {
            jest.spyOn(dao, 'getAllDocumentsOfSameType').mockRejectedValue("Unexpected error")

            await expect(controller.getAllDocumentsOfSameType("Material effect")).rejects.toEqual("Unexpected error");
            expect(dao.getAllDocumentsOfSameType).toBeCalledWith("Material effect");
          
        });
    });

    describe(' addResourceToDocument', () => {
        test("It should adds a resource to the specified document in the database", async () => {
            jest.spyOn(dao, 'addResourceToDocument').mockResolvedValue(undefined);

            await expect(controller.addResourceToDocument(1,"title","2020-10-10")).resolves.toBeUndefined();
            expect(dao.addResourceToDocument).toBeCalledWith(1,"title","2020-10-10");
        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(dao, 'addResourceToDocument').mockRejectedValue("Database error");

            await expect(controller.addResourceToDocument(1,"title","2020-10-10")).rejects.toEqual("Database error");
            expect(dao.addResourceToDocument).toBeCalledWith(1,"title","2020-10-10");
        });

        test('It should reject with error if an unexpected error occurs', async () => {
            jest.spyOn(dao, 'addResourceToDocument').mockRejectedValue("Unexpected error");

            await expect(controller.addResourceToDocument(1,"title","2020-10-10")).rejects.toEqual("Unexpected error");
            expect(dao.addResourceToDocument).toBeCalledWith(1,"title","2020-10-10");
        });
    });
});