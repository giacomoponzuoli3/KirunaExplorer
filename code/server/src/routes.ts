import express from "express"
import ErrorHandler from "./helper"
import { AuthRoutes } from "./routers/AuthRoutes"
import Authenticator from "./routers/auth"
import { DocumentRoutes } from "./routers/documentRoutes"
import LinkRoutes from "./routers/linkRoutes"


const morgan = require("morgan")
const prefix = "/kiruna"

/**
 * Initializes the routes for the application.
 * 
 * @remarks
 * This function sets up the routes for the application.
 * It defines the routes for the user, authentication, product, and cart resources.
 * 
 * @param {express.Application} app - The express application instance.
 */
function initRoutes(app: express.Application) {
    app.use(morgan("dev")) // Log requests to the console
    app.use(express.json({ limit: "25mb" }))
    app.use(express.urlencoded({ limit: '25mb', extended: true }))

    /**
     * The authenticator object is used to authenticate users.
     * It is used to protect the routes by requiring users to be logged in.
     * It is also used to protect routes by requiring users to have the correct role.
     * All routes must have the authenticator object in order to work properly.
     */
    const authenticator = new Authenticator(app)
    const authRoutes = new AuthRoutes(authenticator)
    const docRoutes = new DocumentRoutes();
    const linkRoutes = new LinkRoutes();

    app.use(`${prefix}/sessions`, authRoutes.getRouter())
    app.use(`${prefix}/doc`, docRoutes.getRouter())
    app.use(`${prefix}/link`, linkRoutes.getRouter())

    ErrorHandler.registerErrorHandler(app)
}

export default initRoutes