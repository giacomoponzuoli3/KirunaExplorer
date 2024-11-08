import DocumentController from "../controllers/documentController"
import express, {Router} from "express"
import {body, param} from "express-validator"
import ErrorHandler from "../helper"
import Authenticator from "./auth"
import {Document} from "../models/document";
import {DocLink} from "../models/document_link";


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
            this.authenticator.isLoggedIn, //error 401
            this.authenticator.isPlanner, //error 401
            body("title").isString(),
            body("stakeHolders").isArray(),
            body("scale").isString(),
            body("issuanceDate").isString(),
            body("type").isString(),
            body("language").optional({ nullable: true }).isString(),
            body("pages").optional({ nullable: true }).isString(),
            body("description").optional({ nullable: true }).isString(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.addDocument(
                        req.body["title"],
                        req.body["stakeHolders"],
                        req.body["scale"],
                        req.body["issuanceDate"],
                        req.body["type"],
                        req.body["language"],
                        req.body["pages"],
                        req.body["description"]
                    )
                        .then(() => res.status(200).json({ message: "Document added successfully" }))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );
    

        this.router.get(
            "/",
            (_req: any, res: any, next: any) => {
                try {
                    this.controller.getAllDocuments()
                        .then((documents: Document[]) => res.status(200).json(documents))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:id",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.getDocumentById(req.params["id"])
                        .then((document: Document) => res.status(200).json(document))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.delete(
            "/:id",
            this.authenticator.isLoggedIn, //error 401
            this.authenticator.isPlanner, //error 401
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.deleteDocument(req.params["id"])
                        .then(() => res.status(200).json({ message: "Document deleted successfully" }))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.patch(
            "/:id",
            this.authenticator.isLoggedIn, //error 401
            this.authenticator.isPlanner, //error 401
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
            (req: any, res: any, next: any) => {
                try {
                    this.controller.editDocument(
                        req.params["id"],
                        req.body["title"],
                        req.body["stakeHolders"],
                        req.body["scale"],
                        req.body["issuanceDate"],
                        req.body["type"],
                        req.body["language"],
                        req.body["pages"],
                        req.body["description"]
                    )
                        .then(() => res.status(200).json({ message: "Document updated successfully" }))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:id/links",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.getDocumentLinksById(req.params["id"])
                        .then((links: DocLink[]) => res.status(200).json(links))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:id/title",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.getDocumentTitleById(req.params["id"])
                        .then((title: string) => res.status(200).json(title))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:id/description",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.getDocumentDescriptionById(req.params["id"])
                        .then((description: string) => res.status(200).json(description))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:id/issuanceDate",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.getDocumentIssuanceDateById(req.params["id"])
                        .then((date: string) => res.status(200).json(date))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.post(
            "/type",
            body("type").isString().notEmpty(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const documents = await this.controller.getAllDocumentsOfSameType(req.body["type"]);
                    res.status(200).json(documents);
                } catch (err) {
                    next(err);
                }
            }
        );

    }
}

export {DocumentRoutes}