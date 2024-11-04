import DocumentController from "../controllers/documentController"
import express, {Router} from "express"
import {body, oneOf, param, query} from "express-validator"
import ErrorHandler from "../helper"
import {Document} from "../models/document"
import { link } from "fs"
import Authenticator from "./auth"

class DocumentRoutes {
    private controller: DocumentController
    private readonly router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    constructor(authenticator: Authenticator) {
        this.controller = new DocumentController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.authenticator = authenticator;
        this.initRoutes()
    }

    getRouter(): Router {
        return this.router
    }

    initRoutes() {
        
        this.router.post(
            "/",
            body("title").isString(),
            body("stakeHolders").isArray(),
            body("scale").isString(),
            body("issuanceDate").isString(),
            body("type").isString(),
            body("language").optional({ nullable: true }).isString(),
            body("pages").optional({ nullable: true }).isString(),
            body("description").optional({ nullable: true }).isString(),
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
            param("id").isNumeric(),
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
            param("id").isNumeric(),
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
            param("id").isNumeric(),
            body("title").isString(),
            body("stakeHolders").isArray(),
            body("scale").isString(),
            body("issuanceDate").isString(),
            body("type").isString(),
            body("language").optional({ nullable: true }).isString(),
            body("pages").optional({ nullable: true }).isString(),
            body("description").optional({ nullable: true }).isString(),
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

        this.router.get(
            "/:id/links",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const links = await this.controller.getDocumentLinksById(req.params["id"]);
                    res.status(200).json(links);
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:id/title",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const document = await this.controller.getDocumentTitleById(req.params["id"]);
                    res.status(200).json(document);
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:id/description",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const document = await this.controller.getDocumentDescriptionById(req.params["id"]);
                    res.status(200).json(document);
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:id/issuanceDate",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const document = await this.controller.getDocumentIssuanceDateById(req.params["id"]);
                    res.status(200).json(document);
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:type",
            param("type").isString().notEmpty(),
            async (req: any, res: any, next: any) => {
                try {
                    const documents = await this.controller.getAllDocumentsOfSameType(req.params["type"]);
                    res.status(200).json(documents);
                } catch (err) {
                    next(err);
                }
            }
        );

    }
}

export {DocumentRoutes}