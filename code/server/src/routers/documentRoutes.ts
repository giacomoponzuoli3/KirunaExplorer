import DocumentController from "../controllers/documentController"
import express, {Router} from "express"
import {body, oneOf, param, query} from "express-validator"
import ErrorHandler from "../helper"
import {Document} from "../models/document"

class DocumentRoutes {
    private controller: DocumentController
    private readonly router: Router
    private errorHandler: ErrorHandler

    constructor() {
        this.controller = new DocumentController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.initRoutes()
    }

    getRouter(): Router {
        return this.router
    }

    initRoutes() {
        
        this.router.post(
            "/",
            body("title").isString(),
            body("stakeHolders").isString(),
            body("scale").isString(),
            body("issuanceDate").isString(),
            body("type").isString(),
            body("language").isString(),
            body("pages").isString(),
            body("description").isString(),
            this.errorHandler.validateRequest,
                async (req: any, res: any, next: any) => {
                try {
                    await this.controller.addDocument(req.body["title"], req.body["stakeHolders"], req.body["scale"], req.body["issuanceDate"], req.body["type"], req.body["language"], req.body["pages"], req.body["description"]);
                    res.status(200).json({ message: "Document added successfully" });
                } catch (err) {
                    next(err);
                }
            }
        );
    

        this.router.get(
            "/",
            async (req: any, res: any, next: any) => {
                try {
                    const documents = await this.controller.getAllDocuments();
                    res.status(200).json(documents);
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:id",
            param("id").isString(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const document = await this.controller.getDocumentById(req.params["id"]);
                    res.status(200).json(document);
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.delete(
            "/:id",
            param("id").isString(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.deleteDocument(req.params["id"]);
                    res.status(200).json({ message: "Document deleted successfully" });
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.patch(
            "/:id",
            param("id").isString(),
            body("title").isString(),
            body("stakeHolders").isString(),
            body("scale").isString(),
            body("issuanceDate").isString(),
            body("type").isString(),
            body("language").isString(),
            body("pages").isString(),
            body("description").isString(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.editDocument(req.params["id"], req.body["title"], req.body["stakeHolders"], req.body["scale"], req.body["issuanceDate"], req.body["type"], req.body["language"], req.body["pages"], req.body["description"]);
                    res.status(200).json({ message: "Document updated successfully" });
                } catch (err) {
                    next(err);
                }
            }
        );
    }
}

export {DocumentRoutes}