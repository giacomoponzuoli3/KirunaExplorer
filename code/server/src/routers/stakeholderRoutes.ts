import express, {Router} from "express"
import ErrorHandler from "../helper"
import StakeholderController from "../controllers/stakeholderController"
import {Stakeholder} from "../models/stakeholder";

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
            (_req: any, res: any, next: any) => {
                try {
                    this.controller.getAllStakeholders()
                        .then((stakeholders: Stakeholder[]) => res.status(200).json(stakeholders))
                        .catch((err: Error) => next(err))
                } catch (err) {
                    next(err);
                }
            }
        );
    }
}

export {StakeholderRoutes}