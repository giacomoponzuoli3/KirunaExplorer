import { ScaleController } from "../controllers/scaleController"
import express, {Router} from "express"
import ErrorHandler from "../helper"
import Scale from "../models/scale";
import Authenticator from "./auth";

class ScaleRoutes {
    private controller: ScaleController
    private readonly router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    constructor(authenticator: Authenticator) {
        this.controller = new ScaleController()
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

                this.controller.getScales()
                    .then((scales: Scale[]) => res.status(200).json(scales))
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
                        return res.status(422).json({ error: "Invalid scale name provided" });
                    }

                    await this.controller.addScale(name);
                    res.status(200).json({ message: "Scale added successfully" });
                } catch (err) {
                    //console.error("Error in POST /scales:", err);
                    next(err);
                }
            }
        )
    }
}

export default ScaleRoutes
