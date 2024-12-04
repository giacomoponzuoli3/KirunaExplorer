import express from "express"
import ErrorHandler from "./helper"
import { AuthRoutes } from "./routers/AuthRoutes"
import Authenticator from "./routers/auth"
import { DocumentRoutes } from "./routers/documentRoutes"
import LinkRoutes from "./routers/linkRoutes"
import { StakeholderRoutes } from "./routers/stakeholderRoutes"
import { CoordinatesRoutes } from "./routers/coordinatesRoutes"
import ScaleRoutes from "./routers/scaleRoutes"


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
    app.use(express.json({ limit: "50mb" }))
    app.use(express.urlencoded({ limit: '50mb', extended: true }))

    /**
     * The authenticator object is used to authenticate users.
     * It is used to protect the routes by requiring users to be logged in.
     * It is also used to protect routes by requiring users to have the correct role.
     * All routes must have the authenticator object in order to work properly.
     */
    const authenticator = new Authenticator(app)
    const authRoutes = new AuthRoutes(authenticator)
    const docRoutes = new DocumentRoutes(authenticator);
    const linkRoutes = new LinkRoutes(authenticator);
    const stakeholderRoutes = new StakeholderRoutes();
    const coordinatesRoutes = new CoordinatesRoutes(authenticator);
    const scaleRoutes = new ScaleRoutes(authenticator);

    app.use(`${prefix}/sessions`, authRoutes.getRouter())
    app.use(`${prefix}/doc`, docRoutes.getRouter())
    app.use(`${prefix}/link`, linkRoutes.getRouter())
    app.use(`${prefix}/stakeholders`, stakeholderRoutes.getRouter())
    app.use(`${prefix}/coordinates`, coordinatesRoutes.getRouter())
    app.use(`${prefix}/scale`, scaleRoutes.getRouter())

    ErrorHandler.registerErrorHandler(app)
}

export default initRoutes