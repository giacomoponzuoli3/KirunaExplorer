import { LinkController } from "../controllers/linkController"
import express, {Router} from "express"
import {body} from "express-validator"
import ErrorHandler from "../helper"
import Link from "../models/link";
import Authenticator from "./auth";

class LinkRoutes {
    private controller: LinkController
    private readonly router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    constructor(authenticator: Authenticator) {
        this.controller = new LinkController()
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
            body("idDoc1").isNumeric(),
            body("idDoc2").isNumeric(),
            body("idLink").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.addLink(req.body.idDoc1, req.body.idDoc2, req.body.idLink)
                        .then(() => res.status(200).json({ message: "Link added successfully" }))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err)
                }
            }
        )

        this.router.delete(
            "/",
            this.authenticator.isLoggedIn, //error 401
            this.authenticator.isPlanner, //error 401
            body("idDoc1").isNumeric(),
            body("idDoc2").isNumeric(),
            body("idLink").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.deleteLink(req.body.idDoc1, req.body.idDoc2, req.body.idLink)
                        .then(() => res.status(200).json({ message: "Link deleted successfully" }))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err)
                }
            }
        )

        this.router.patch(
            "/",
            this.authenticator.isLoggedIn, //error 401
            this.authenticator.isPlanner, //error 401
            body("idDoc1").isNumeric(),
            body("idDoc2").isNumeric(),
            body("oldLinkId").isNumeric(),
            body("newLinkId").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.updateLink(req.body.idDoc1, req.body.idDoc2, req.body.oldLinkId, req.body.newLinkId)
                        .then(() => res.status(200).json({ message: "Link updated successfully" }))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err)
                }
        })

        this.router.get(
            "/",
            (_req: any, res: any, next: any) => {
                try {
                    this.controller.getAllLinks()
                        .then((links: Link[]) => res.status(200).json(links))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err)
                }
            }
        )
    }
}

export default LinkRoutes
