import {CoordinatesController} from "../controllers/coordinatesController"
import express, {Router} from "express"
import {body, param} from "express-validator"
import ErrorHandler from "../helper"
import Authenticator from "./auth"
import {DocCoordinates} from "../models/document_coordinate";


class CoordinatesRoutes {
    private controller: CoordinatesController
    private readonly router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    constructor(authenticator: Authenticator) {
        this.controller = new CoordinatesController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.authenticator = authenticator;
        this.initRoutes()
    }

    getRouter(): Router {
        return this.router
    }

    initRoutes() {
        
        this.router.get(
            "/",
            (_req: any, res: any, next: any) => {
                try {
                    this.controller.getAllDocumentsCoordinates()
                        .then((docCoordinates: DocCoordinates[]) => res.status(200).json(docCoordinates))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.post(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isPlanner, 
            body("idDoc").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.setDocumentCoordinates(req.body.idDoc, req.body.coordinates)
                        .then(() => res.status(200).json({ message: "Coordinates added successfully" }))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err)
                }
            }
        )
    }
}

export {CoordinatesRoutes}