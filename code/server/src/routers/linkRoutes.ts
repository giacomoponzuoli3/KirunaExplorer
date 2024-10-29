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
            body("name").isString(),
            body("idDoc1").isNumeric(),
            body("idDoc2").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.addLink(req.body.idDoc1, req.body.idDoc2, req.body.name)
                    res.status(200).json({ message: "Link added successfully" })
                } catch (err) {
                    next(err)
                }
            }
        )

        this.router.delete(
            "/:id",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.deleteLink(req.params.id)
                    res.status(200).json({ message: "Link deleted successfully" })
                } catch (err) {
                    next(err)
                }
            }
        )

        this.router.patch(
            "/:id",
            param("id").isNumeric(),
            body("name").isString(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.updateLink(req.param.id, req.body.name)
                    res.status(200).json({ message: "Link updated successfully" })
                } catch (err) {
                    next(err)
                }
        })

        this.router.get(
            "/:id",
            param("id").isNumeric(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const link = await this.controller.getLinkById(req.params.id)
                    res.status(200).json(link)
                } catch (err) {
                    next(err)
                }
            }
        )

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
