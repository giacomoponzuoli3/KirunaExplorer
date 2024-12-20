import DocumentController from "../controllers/documentController"
import express, {Router} from "express"
import {body, param} from "express-validator"
import ErrorHandler from "../helper"
import Authenticator from "./auth"
import {DocLink} from "../models/document_link";
import { DocCoordinates } from "../models/document_coordinate"


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
            this.authenticator.isPlanner, //error 403
            body("title").isString(),
            body("stakeHolders").isArray(),
            body("scale").isString(),
            body("issuanceDate").isString(),
            body("type").isString(),
            body("language").optional({ nullable: true }).isString(),
            body("pages").optional({ nullable: true }).isString(),
            body("description").isString(),
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
                        .then((document: DocCoordinates) => res.status(200).json(document))
                        .catch((err: Error) => {next(err); console.log(err);})
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
                        .then((document: DocCoordinates) => res.status(200).json(document))
                        .catch((err: Error) => {
                            //console.log(err)
                            next(err)
                        })
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.delete(
            "/:id",
            this.authenticator.isLoggedIn, //error 401
            this.authenticator.isPlanner, //error 403
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
            this.authenticator.isPlanner, //error 403
            param("id").isNumeric(),
            body("title").isString(),
            body("stakeHolders").isArray(),
            body("scale").isString(),
            body("issuanceDate").isString(),
            body("type").isString(),
            body("language").optional({ nullable: true }).isString(),
            body("pages").optional({ nullable: true }).isString(),
            body("description").isString(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.editDocument(
                        parseInt(req.params["id"], 10),
                        req.body["title"],
                        req.body["stakeHolders"],
                        req.body["scale"],
                        req.body["issuanceDate"],
                        req.body["type"],
                        req.body["language"],
                        req.body["pages"],
                        req.body["description"]
                    )
                        .then((document: DocCoordinates) => res.status(200).json(document))
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

        this.router.post(
            "/res",
            this.authenticator.isLoggedIn, //error 401
            this.authenticator.isPlanner, //error 403
            body("idDoc").isNumeric(),
            body("name").isString().notEmpty(),
            body("data"),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const document = await this.controller.addResourceToDocument(req.body["idDoc"], req.body["name"], req.body["data"]);
                    res.status(200).json(document);
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/res/:idDoc/:idRes",
            param("idDoc").isNumeric(),
            param("idRes").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const resources = await this.controller.getResourceData(req.params["idDoc"], req.params["idRes"]);
                    res.status(200).json(resources);
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/res-all/:idDoc",
            param("idDoc").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const resources = await this.controller.getAllResourcesData(req.params["idDoc"]);
                    res.status(200).json(resources);
                } catch (err) {
                    next(err);
                }
            }
        );

         this.router.delete(
            "/res/:idDoc/:name",
            this.authenticator.isLoggedIn, //error 401
            this.authenticator.isPlanner, //error 403
            param("idDoc").isNumeric(),
            param("name").isString().notEmpty(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {

                this.controller.deleteResource(req.params["idDoc"], req.params["name"])
                    .then(() => res.status(200).json({ message: "Document deleted successfully" }))
                    .catch((err: Error) => next(err))
            }
        );
    }
}

export {DocumentRoutes}
