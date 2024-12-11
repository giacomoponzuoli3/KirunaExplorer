import { TypeController } from "../controllers/typeController"
import express, {Router} from "express"
import ErrorHandler from "../helper"
import DocType from "../models/type";
import Authenticator from "./auth";

class TypeRoutes {
    private controller: TypeController
    private readonly router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    constructor(authenticator: Authenticator) {
        this.controller = new TypeController()
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

                this.controller.getTypes()
                    .then((types: DocType[]) => res.status(200).json(types))
                    .catch((err: Error) => next(err))
            }
        )
        

        this.router.post(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isPlanner,
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const {name} = req.body
                    if (!name || typeof name !== 'string') {
                        return res.status(422).json({ error: "Invalid type name provided" });
                    }

                    await this.controller.addTypes(name);
                    res.status(200).json({ message: "Type added successfully" });
                } catch (err) {
                    console.error("Error in POST /types:", err);
                    next(err);
                }
            }
        )
    }
}

export default TypeRoutes
