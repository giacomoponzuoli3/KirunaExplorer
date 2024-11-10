import { describe, beforeAll, afterEach, test, expect, jest } from "@jest/globals"
import DocumentController from "../../src/controllers/documentController"
import { Document } from "../../src/models/document"
import { Stakeholder } from "../../src/models/stakeholder"
import { DocLink } from "../../src/models/document_link"
import Link from "../../src/models/link"
import { app } from "../../index";
import request from 'supertest';
import Authenticator from "../../src/routers/auth"
import { User } from "../../src/models/user"

const baseURL = "/kiruna/doc"

jest.mock("../../src/controllers/documentController.ts");
jest.mock("../../src/routers/auth");

describe('documentRoutes', () => {

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const controller = DocumentController.prototype;
    const u = new User("urban_planner","urban","planner","Urban Planner");
    const testId = 1;
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testDocument = new Document(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
    const testDocument2 = new Document(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2");
    const testDocument3 = new Document(3, "title 3", [testStakeholder2], "1:1", "2020-10-10", "Material effect", "English", "300", "description 3");
    const links = [
        new DocLink(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", new Link(1, "Link A")),
        new DocLink(3, "title 3", [testStakeholder2], "1:1", "2020-10-10", "Material effect", "English", "300", "description 3", new Link(2, "Link B"))
    ];

    describe('POST /', () => {


        test('It should register a document and return 200 status', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            jest.spyOn(controller, "addDocument").mockResolvedValueOnce(testDocument);
            console.log("pocnav")
            const response = await request(app).post(baseURL + '/')
            .send({
                title: "title",
                stakeHolders: [testStakeholder1, testStakeholder2],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            }).timeout({ deadline: 5000 });
            console.log("wooo")
            expect(response.status).toBe(200);
            expect(response.body).toEqual(testDocument);
            expect(controller.addDocument).toHaveBeenCalledWith(
                "title",
                [testStakeholder1, testStakeholder2],
                "1:1",
                "2020-10-10",
                "Informative document",
                "English",
                "300",
                "description"
            );
        });

        test('It should return 422 status if the body is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
                .send({});
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if title is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: 1,
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if title is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: null,
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if stakeHolders is not an array', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: { id: 1, name: "John", role: "urban developer" },
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if stakeHolders is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: null,
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if scale is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: 1,
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if scale is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: null,
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if issuanceDate is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: 1,
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if issuanceDate is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: null,
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if type is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: 1,
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if type is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: null,
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if language is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: 1,
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if pages is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: 300,
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if description is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: 1
            });
            expect(response.status).toBe(422); 
            expect(controller.addDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            jest.spyOn(controller, 'addDocument').mockRejectedValueOnce(new Error('Internal Server Error'));
           
            const response = await request(app).post(baseURL+"/")
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('GET /', () => {
        test('It should retrieve all the documents and return 200 status', async () => {
            jest.spyOn(controller, "getAllDocuments").mockResolvedValueOnce([testDocument,testDocument2,testDocument3]);

            const response = await request(app).get(baseURL+"/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testDocument,testDocument2,testDocument3]);
            expect(controller.getAllDocuments).toHaveBeenCalledWith();
        });

        test('It should return an empty array if there are no documents and return 200 status', async () => {
            jest.spyOn(controller, "getAllDocuments").mockResolvedValueOnce([]);

            const response = await request(app).get(baseURL+"/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
            expect(controller.getAllDocuments).toHaveBeenCalledWith();
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getAllDocuments").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).get(baseURL+"/");

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    });

    describe('GET /:id', () => {

        test('It should retrieve the document with the specified id and return 200 status', async () => {
            jest.spyOn(controller, "getDocumentById").mockResolvedValueOnce(testDocument);

            const response = await request(app).get(baseURL+`/${testId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(testDocument);
            expect(controller.getDocumentById).toHaveBeenCalledWith(`${testId}`);
        });

        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL + `/abc`);

            expect(response.status).toBe(422);
            expect(controller.getDocumentById).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null);

            expect(response.status).toBe(422);
            expect(controller.getDocumentById).not.toHaveBeenCalled(); 
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getDocumentById").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).get(baseURL+`/${testId}`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    });

    describe('DELETE /:id', () => {
        test('It should delete the document with the specified id and return 200 status', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            jest.spyOn(controller, "deleteDocument").mockResolvedValueOnce(undefined);

            const response = await request(app).delete(baseURL+`/${testId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Document deleted successfully" });
            expect(controller.deleteDocument).toHaveBeenCalledWith(`${testId}`);
        });

        
        test('It should return 422 status if the param is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).delete(baseURL + `/abc`);

            expect(response.status).toBe(422);
            expect(controller.deleteDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if the param is null', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).delete(baseURL + `/` + null);

            expect(response.status).toBe(422);
            expect(controller.deleteDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            jest.spyOn(controller, "deleteDocument").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).delete(baseURL+`/${testId}`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('PATCH /:id', () => {
        test('It should edit the document with the specified id and return 200 status', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            jest.spyOn(controller, "editDocument").mockResolvedValueOnce({
                id: testId,
                title: "title",
                stakeHolders: [testStakeholder1, testStakeholder2],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });

            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [testStakeholder1, testStakeholder2],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: testId,
                title: "title",
                stakeHolders: [testStakeholder1, testStakeholder2],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(controller.editDocument).toHaveBeenCalledWith(
                `${testId}`,
                "title",
                [testStakeholder1, testStakeholder2],
                "1:1",
                "2020-10-10",
                "Informative document",
                "English",
                "300",
                "description"
            );
        });

        test('It should return 422 status if the param is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL + `/abc`);

            expect(response.status).toBe(422);
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if the param is null', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL + `/` + null);

            expect(response.status).toBe(422);
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if the body is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
                .send({});
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if title is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: 1,
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if title is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: null,
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if stakeHolders is not an array', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: { id: 1, name: "John", role: "urban developer" },
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if stakeHolders is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: null,
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if scale is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: 1,
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if scale is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: null,
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if issuanceDate is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: 1,
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if issuanceDate is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: null,
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if type is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: 1,
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if type is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: null,
                language: "English",
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if language is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: 1,
                pages: "300",
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if pages is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: 300,
                description: "description"
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if description is not a string', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: 1
            });
            expect(response.status).toBe(422); 
            expect(controller.editDocument).not.toHaveBeenCalled(); 
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
    
            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user=u;
                return next();
            });
            jest.spyOn(controller, 'editDocument').mockRejectedValueOnce(new Error('Internal Server Error'));
           
            const response = await request(app).patch(baseURL+`/${testId}`)
            .send({
                title: "title",
                stakeHolders: [{ id: 1, name: "John", role: "urban developer" }],
                scale: "1:1",
                issuanceDate: "2020-10-10",
                type: "Informative document",
                language: "English",
                pages: "300",
                description: "description"
            });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('GET /:id/links', () => {
        test('It should retrieve all the links connected to a document with the specified id and return 200 status', async () => {
            jest.spyOn(controller, 'getDocumentLinksById').mockResolvedValueOnce(links);
            
            const response = await request(app).get(baseURL+`/${testId}/links`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(links);
            expect(controller.getDocumentLinksById).toHaveBeenCalledWith(`${testId}`);
        });

        
        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL+`/abc/links`);

            expect(response.status).toBe(422);
            expect(controller.getDocumentLinksById).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null + "links");

            expect(response.status).toBe(422);
            expect(controller.getDocumentLinksById).not.toHaveBeenCalled(); 
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getDocumentLinksById").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).get(baseURL+`/${testId}/links`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('GET /:id/title', () => {
        test('It should retrieve the title of a document with the specified id and return 200 status', async () => {
            jest.spyOn(controller, 'getDocumentTitleById').mockResolvedValueOnce("title");
            
            const response = await request(app).get(baseURL+`/${testId}/title`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual("title");
            expect(controller.getDocumentTitleById).toHaveBeenCalledWith(`${testId}`);
        });

        
        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL+`/abc/title`);

            expect(response.status).toBe(422);
            expect(controller.getDocumentTitleById).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null + "title");

            expect(response.status).toBe(422);
            expect(controller.getDocumentTitleById).not.toHaveBeenCalled(); 
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getDocumentTitleById").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).get(baseURL+`/${testId}/title`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('GET /:id/description', () => {
        test('It should retrieve the description of a document with the specified id and return 200 status', async () => {
            jest.spyOn(controller, 'getDocumentDescriptionById').mockResolvedValueOnce("description");
            
            const response = await request(app).get(baseURL+`/${testId}/description`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual("description");
            expect(controller.getDocumentDescriptionById).toHaveBeenCalledWith(`${testId}`);
        });

        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL+`/abc/description`);

            expect(response.status).toBe(422);
            expect(controller.getDocumentDescriptionById).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null + "description");

            expect(response.status).toBe(422);
            expect(controller.getDocumentDescriptionById).not.toHaveBeenCalled(); 
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getDocumentDescriptionById").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).get(baseURL+`/${testId}/description`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('GET /:id/issuanceDate', () => {
        test('It should retrieve the issuance date of a document with the specified id and return 200 status', async () => {
            jest.spyOn(controller, 'getDocumentIssuanceDateById').mockResolvedValueOnce("issuanceDate");
            
            const response = await request(app).get(baseURL+`/${testId}/issuanceDate`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual("issuanceDate");
            expect(controller.getDocumentIssuanceDateById).toHaveBeenCalledWith(`${testId}`);
        });

        test('It should return 422 status if the param is not numeric', async () => {
            const response = await request(app).get(baseURL+`/abc/issuanceDate`);

            expect(response.status).toBe(422);
            expect(controller.getDocumentIssuanceDateById).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if the param is null', async () => {
            const response = await request(app).get(baseURL + `/` + null + "issuanceDate");

            expect(response.status).toBe(422);
            expect(controller.getDocumentIssuanceDateById).not.toHaveBeenCalled(); 
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getDocumentIssuanceDateById").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).get(baseURL+`/${testId}/issuanceDate`);

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('POST /type', () => {
        test('It should retrieve all the documents of the same specified type and return 200 status', async () => {
            jest.spyOn(controller, 'getAllDocumentsOfSameType').mockResolvedValueOnce([testDocument3]);
            
            const response = await request(app).post(baseURL+"/type")
            .send({ type : "Material effect"});

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testDocument3]);
            expect(controller.getAllDocumentsOfSameType).toHaveBeenCalledWith("Material effect");
        });

        test('It should retrieve an empty array if there are no documents of the specified type and return 200 status', async () => {
            jest.spyOn(controller, 'getAllDocumentsOfSameType').mockResolvedValueOnce([]);
            
            const response = await request(app).post(baseURL+"/type")
            .send({ type : "Material effect"});

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
            expect(controller.getAllDocumentsOfSameType).toHaveBeenCalledWith("Material effect");
        });

        test('It should return 422 status if the body is missing', async () => {
            const response = await request(app).post(baseURL+"/type")
                .send({});
            expect(response.status).toBe(422); 
            expect(controller.getAllDocumentsOfSameType).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if type is not a string', async () => {
            const response = await request(app).post(baseURL+"/type")
            .send({ type : 1});

            expect(response.status).toBe(422); 
            expect(controller.getAllDocumentsOfSameType).not.toHaveBeenCalled(); 
        });

        test('It should return 422 status if type is null', async () => {
            const response = await request(app).post(baseURL+"/type")
            .send({ type : null});
            expect(response.status).toBe(422); 
            expect(controller.getAllDocumentsOfSameType).not.toHaveBeenCalled(); 
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getAllDocumentsOfSameType").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).post(baseURL+"/type")
            .send({ type : "Material effect"});

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

});