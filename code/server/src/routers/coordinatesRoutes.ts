import {CoordinatesController} from "../controllers/coordinatesController"
import express, {Router} from "express"
import {body, param} from "express-validator"
import ErrorHandler from "../helper"
import Authenticator from "./auth"
import {DocCoordinates} from "../models/document_coordinate";
import {CoordinatesArrayError, CoordinatesTypeError} from "../errors/coordinates";
import { LatLng } from "../interfaces"

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
                        .then((docCoordinates: DocCoordinates[]) =>  res.status(200).json(docCoordinates))
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
            body("coordinates").custom((value) => {
                const isLatLng = (obj: any): boolean => obj && typeof obj.lat === 'number' && typeof obj.lng === 'number';
        
                if (!Array.isArray(value) && !isLatLng(value)) throw new CoordinatesTypeError;
                if (Array.isArray(value) && !value.every(isLatLng)) throw new CoordinatesArrayError;
                return true;
            }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.setDocumentCoordinates(req.body.idDoc, req.body.coordinates)
                        .then(() => {
                            return res.status(200).json({ message: "Coordinates added successfully" });})
                        .catch((err: Error) => next(err));
                } catch (err) {
                    next(err);
                }
            }
        )

        this.router.post(
            "/update",
            this.authenticator.isLoggedIn,
            this.authenticator.isPlanner, 
            body("idDoc").isNumeric(),
            body("coordinates").custom((value) => {
                const isLatLng = (obj: any): boolean => obj && typeof obj.lat === 'number' && typeof obj.lng === 'number';
        
                if (!Array.isArray(value) && !isLatLng(value)) throw new CoordinatesTypeError;
                if (Array.isArray(value) && !value.every(isLatLng)) throw new CoordinatesArrayError;

                return true;
            }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.updateDocumentCoordinates(req.body.idDoc, req.body.coordinates, req.body.useMunicipalArea)
                        .then(() => res.status(200).json({ message: "Coordinates updated successfully" }))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err)
                }
            }
        )
        
        /**
         * Delete of a documet's coordinates by the id_document
         * 
         */
        this.router.delete(
            "/:id",
            this.authenticator.isLoggedIn,
            this.authenticator.isPlanner,
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.deleteDocumentCoordinates(req.params["id"])
                        .then(() => res.status(200).json({ message: "Document's coordinates deleted successfully" }))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
            
        )

    }
}

export {CoordinatesRoutes}