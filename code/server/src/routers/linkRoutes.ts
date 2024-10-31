import { LinkController } from "../controllers/linkController"
import express, {Router} from "express"
import {body, oneOf, param, query} from "express-validator"
import ErrorHandler from "../helper"

class LinkRoutes {
    private controller: LinkController
    private readonly router: Router
    private errorHandler: ErrorHandler

    constructor() {
        this.controller = new LinkController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.initRoutes()
    }

    getRouter(): Router {
        return this.router
    }

    initRoutes() {

        this.router.post(
            "/",
            body("idDoc1").isNumeric(),
            body("idDoc2").isNumeric(),
            body("idLink").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.addLink(req.body.idDoc1, req.body.idDoc2, req.body.idLink)
                    res.status(200).json({ message: "Link added successfully" })
                } catch (err) {
                    next(err)
                }
            }
        )

        this.router.delete(
            "/",
            body("idDoc1").isNumeric(),
            body("idDoc2").isNumeric(),
            body("idLink").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.deleteLink(req.body.idDoc1, req.body.idDoc2, req.body.idLink)
                    res.status(200).json({ message: "Link deleted successfully" })
                } catch (err) {
                    next(err)
                }
            }
        )

        this.router.patch(
            "/",
            body("idDoc1").isNumeric(),
            body("idDoc2").isNumeric(),
            body("oldLinkId").isNumeric(),
            body("newLinkId").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.updateLink(req.body.idDoc1, req.body.idDoc2, req.body.oldLinkId, req.body.newLinkId)
                    res.status(200).json({ message: "Link updated successfully" })
                } catch (err) {
                    next(err)
                }
        })

        this.router.get(
            "/",
            async (req: any, res: any, next: any) => {
                try {
                    const links = await this.controller.getAllLinks()
                    res.status(200).json(links)
                } catch (err) {
                    next(err)
                }
            }
        )
    }
}

export default LinkRoutes
