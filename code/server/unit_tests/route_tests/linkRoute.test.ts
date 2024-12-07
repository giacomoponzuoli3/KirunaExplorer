import { describe, afterEach, test, expect, jest } from "@jest/globals"
import request from 'supertest'
import express, { Express } from 'express'
import LinkRoutes from '../../src/routers/linkRoutes'
import { LinkController } from '../../src/controllers/linkController'
import Link from "../../src/models/link"
import { app } from "../../index";
import Authenticator from "../../src/routers/auth"
import { User } from "../../../common_models/user"

const baseURL = '/kiruna/link'

jest.mock('../../src/controllers/linkController');
jest.mock("../../src/routers/auth");

describe('LinkRoutes Unit Tests', () => {

    const controller = LinkController.prototype;
    const u = new User("urban_planner", "urban", "planner", "Urban Planner");
    const testLink = new Link(1, "link");

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    })

    describe('POST /', () => {
        test("It should add a link and return 200", async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            jest.spyOn(controller, "addLink").mockResolvedValueOnce(undefined);

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Link added successfully" });
            expect(controller.addLink).toHaveBeenCalledWith(1, 2, 1);
        })

        test('It should return 422 status if the body is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + "/")
                .send({});
            expect(response.status).toBe(422);
            expect(controller.addLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc1 is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: "abc",
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(422);
            expect(controller.addLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc1 is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(422);
            expect(controller.addLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc2 is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: "abc",
                    idLink: 1
                });

            expect(response.status).toBe(422);
            expect(controller.addLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc2 is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idLink: 1
                });

            expect(response.status).toBe(422);
            expect(controller.addLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idLink is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: "abc"
                });

            expect(response.status).toBe(422);
            expect(controller.addLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idLink is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2
                });

            expect(response.status).toBe(422);
            expect(controller.addLink).not.toHaveBeenCalled();
        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "addLink").mockResolvedValueOnce(undefined);

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                return res.status(403).json({ error: "User is not an urban planner" });
            });

            jest.spyOn(controller, "addLink").mockResolvedValueOnce(undefined);

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(403);

            expect(response.body.error).toBe('User is not an urban planner');
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, 'addLink').mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).post(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    });

    describe('DELETE /', () => {
        test("It should delete a link and return 200", async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            jest.spyOn(controller, "deleteLink").mockResolvedValueOnce(undefined);

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Link deleted successfully" });
            expect(controller.deleteLink).toHaveBeenCalledWith(1, 2, 1);
        })

        test('It should return 422 status if the body is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).delete(baseURL + '/')
                .send({});
            expect(response.status).toBe(422);
            expect(controller.deleteLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc1 is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: "abc",
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(422);
            expect(controller.deleteLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc1 is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
   
            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(422);
            expect(controller.deleteLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc2 is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: "abc",
                    idLink: 1
                });

            expect(response.status).toBe(422);
            expect(controller.deleteLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc2 is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
          
            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idLink: 1
                });

            expect(response.status).toBe(422);
            expect(controller.deleteLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idLink is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: "abc"
                });

            expect(response.status).toBe(422);
            expect(controller.deleteLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idLink is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2
                });

            expect(response.status).toBe(422);
            expect(controller.deleteLink).not.toHaveBeenCalled();
        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "deleteLink").mockResolvedValueOnce(undefined);

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                return res.status(403).json({ error: "User is not an urban planner" });
            });

            jest.spyOn(controller, "deleteLink").mockResolvedValueOnce(undefined);

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(403);

            expect(response.body.error).toBe('User is not an urban planner');
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "deleteLink").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).delete(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    idLink: 1
                });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    })

    describe('PATCH /', () => {
        test("It should update a link and return 200", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
            jest.spyOn(controller, "updateLink").mockResolvedValueOnce(undefined);

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Link updated successfully" });
            expect(controller.updateLink).toHaveBeenCalledWith(1, 2, 1, 2);
        })

        test('It should return 422 status if the body is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).patch(baseURL + '/')
                .send({});
            expect(response.status).toBe(422);
            expect(controller.updateLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc1 is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: "abc",
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                });

            expect(response.status).toBe(422);
            expect(controller.updateLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc1 is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
   
            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                });

            expect(response.status).toBe(422);
            expect(controller.updateLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc2 is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: "abc",
                    oldLinkId: 1,
                    newLinkId: 2
                });

            expect(response.status).toBe(422);
            expect(controller.updateLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if idDoc2 is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });
          
            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    oldLinkId: 1,
                    newLinkId: 2
                });

            expect(response.status).toBe(422);
            expect(controller.updateLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if oldLinkId is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: "abc",
                    newLinkId: 2
                });

            expect(response.status).toBe(422);
            expect(controller.updateLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if oldLinkId is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,  
                    newLinkId: 2
                });

            expect(response.status).toBe(422);
            expect(controller.updateLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if newLinkId is not numeric', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: "abc"
                });

            expect(response.status).toBe(422);
            expect(controller.updateLink).not.toHaveBeenCalled();
        });

        test('It should return 422 status if newLinkId is missing', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,  
                    oldLinkId: 1
                });

            expect(response.status).toBe(422);
            expect(controller.updateLink).not.toHaveBeenCalled();
        });

        test('It should return 401 status if the user is not logged in', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user" });
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "updateLink").mockResolvedValueOnce(undefined);

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthenticated user');
        });

        test('It should return 403 status if the user is not an urban planner', async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                return res.status(403).json({ error: "User is not an urban planner" });
            });

            jest.spyOn(controller, "updateLink").mockResolvedValueOnce(undefined);

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                });

            expect(response.status).toBe(403);

            expect(response.body.error).toBe('User is not an urban planner');
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(Authenticator.prototype, "isPlanner").mockImplementation((req, res, next) => {
                req.user = u;
                return next();
            });

            jest.spyOn(controller, "updateLink").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).patch(baseURL + '/')
                .send({
                    idDoc1: 1,
                    idDoc2: 2,
                    oldLinkId: 1,
                    newLinkId: 2
                });

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });
    })

    describe('GET /', () => {
        test('It should retrieve all the links and return 200 status', async () => {
            jest.spyOn(controller, "getAllLinks").mockResolvedValueOnce([testLink]);

            const response = await request(app).get(baseURL+"/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testLink]);
            expect(controller.getAllLinks).toHaveBeenCalledWith();
        });

        test('It should return an empty array if there are no links and return 200 status', async () => {
            jest.spyOn(controller, "getAllLinks").mockResolvedValueOnce([]);

            const response = await request(app).get(baseURL+"/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
            expect(controller.getAllLinks).toHaveBeenCalledWith();
        });

        test('It should return 503 if there is an error', async () => {
            jest.spyOn(controller, "getAllLinks").mockRejectedValueOnce(new Error('Internal Server Error'));

            const response = await request(app).get(baseURL+"/");

            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Internal Server Error');
        });

    })
});
