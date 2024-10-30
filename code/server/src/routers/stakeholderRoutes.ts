import express, {Router} from "express"
import {body, oneOf, param, query} from "express-validator"
import ErrorHandler from "../helper"
import {Document} from "../models/document"
import StakeholderController from "../controllers/stakeholderController"

class StakeholderRoutes {
    private controller: StakeholderController
    private readonly router: Router
    private errorHandler: ErrorHandler

    constructor() {
        this.controller = new StakeholderController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.initRoutes()
    }

    getRouter(): Router {
        return this.router
    }

    initRoutes() {
        
       

        this.router.get(
            "/",
            async (req: any, res: any, next: any) => {
                try {
                    const stakeholders = await this.controller.getAllStakeholders();
                    res.status(200).json(stakeholders);
                } catch (err) {
                    next(err);
                }
            }
        );
    }
}

export {StakeholderRoutes}