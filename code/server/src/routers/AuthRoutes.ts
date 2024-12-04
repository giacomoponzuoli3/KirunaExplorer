import express, { Router } from "express"
import Authenticator from "./auth"
import { body } from "express-validator"
import { User } from "../../../common_models/user";
import UserController from "../controllers/userController"
import ErrorHandler from "../helper"

/**
 * Represents a class that defines the authentication routes for the application.
 */
class AuthRoutes {
    private readonly router: Router
    private errorHandler: ErrorHandler
    private authService: Authenticator
    private controller: UserController

    /**
     * Constructs a new instance of the UserRoutes class.
     * @param authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authService = authenticator
        this.errorHandler = new ErrorHandler()
        this.router = express.Router();
        this.initRoutes();
    }

    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the authentication routes.
     * 
     * @remarks
     * This method sets up the HTTP routes for login, logout, and retrieval of the logged-in user.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     */
    initRoutes() {

        /**
         * Route for creating a user.
         * It does not require authentication.
         * It requires the following body parameters:
         * - username: string. It cannot be empty, and it must be unique (an existing username cannot be used to create a new user)
         * - name: string. It cannot be empty.
         * - surname: string. It cannot be empty.
         * - password: string. It cannot be empty.
         * It returns a 200 status code.
         */
        this.router.post(
            "/register",
            body('username').notEmpty(),
            body('name').notEmpty(),
            body('surname').notEmpty(),
            body('password').notEmpty(),
            body('role').isIn(['Resident','Urban Planner']),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.controller.createUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.role)
                        .then(() => res.status(200).end())
                        .catch((err) => next(err))
                } catch (e) {
                    next(e);
                }
            }
        )


        /**
         * Route for logging in a user.
         * It does not require authentication.
         * It expects the following parameters:
         * - username: string. It cannot be empty.
         * - password: string. It cannot be empty.
         * It returns an error if the username represents a non-existing user or if the password is incorrect.
         * It returns the logged-in user.
         */
        this.router.post(
            "/",
            body('username').notEmpty(),
            body('password').notEmpty(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                try {
                    this.authService.login(req, res, next)
                        .then((user: User) => res.status(200).json(user))
                        .catch((err: any) => res.status(401).json(err))
                } catch (e) {
                    next(e);
                }
            }
        )

        /**
         * Route for logging out the currently logged-in user.
         * It expects the user to be logged in.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/current",
            this.authService.isLoggedIn,
            (req, res, next) => {
                try {
                    this.authService.logout(req)
                        .then(() => res.status(200).end())
                        .catch((err: any) => next(err))
                } catch (e) {
                    next(e);
                }
            }
        )

        /**
         * Route for retrieving the currently logged-in user.
         * It expects the user to be logged in.
         * It returns the logged-in user.
         */
        this.router.get(
            "/current",
            this.authService.isLoggedIn,
            (req: any, res: any) => res.status(200).json(req.user)
        )

        
    }
}

export { AuthRoutes }