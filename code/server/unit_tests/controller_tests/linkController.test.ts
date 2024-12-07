import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { LinkController } from "../../src/controllers/linkController";
import { LinkDAO } from "../../src/dao/linkDAO"; // Ensure this import remains as per your requirement
import Link from "../../src/models/link";

// Mock the LinkDAO class
jest.mock("../../src/dao/linkDAO");

describe("LinkController", () => {

  const dao = LinkDAO.prototype;
  const controller = new LinkController();

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock history before each test
  });

  describe("addLink", () => {
    test("It should successfully add a link", async () => {
      jest.spyOn(dao, 'addLink').mockResolvedValue(undefined);

      await expect(controller.addLink(1, 2, 3)).resolves.toBeUndefined();
      expect(dao.addLink).toHaveBeenCalledWith(1, 2, 3);
    });

    test("It should handle errors from LinkDAO when adding a link", async () => {
      jest.spyOn(dao, 'addLink').mockRejectedValue(new Error("Add link error"));

      await expect(controller.addLink(1, 2, 3)).rejects.toThrow("Add link error");
      expect(dao.addLink).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe("deleteLink", () => {
    test("It should successfully delete a link", async () => {
      jest.spyOn(dao, 'deleteLinks').mockResolvedValue(undefined);

      await expect(controller.deleteLink(1, 2, 3)).resolves.toBeUndefined();
      expect(dao.deleteLinks).toHaveBeenCalledWith(1, 2, 3);
    });

    test("It should handle errors from LinkDAO when deleting a link", async () => {
      jest.spyOn(dao, 'deleteLinks').mockRejectedValue(new Error("Delete link error"));

      await expect(controller.deleteLink(1, 2, 3)).rejects.toThrow("Delete link error");
      expect(dao.deleteLinks).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe("updateLink", () => {
    test("It should successfully update a link", async () => {
      jest.spyOn(dao, 'updateLink').mockResolvedValue(undefined);

      await expect(controller.updateLink(1, 2, 3, 4)).resolves.toBeUndefined();
      expect(dao.updateLink).toHaveBeenCalledWith(1, 2, 3, 4);
    });

    test("It should handle errors from LinkDAO when updating a link", async () => {
      jest.spyOn(dao, 'updateLink').mockRejectedValue(new Error("Update link error"));

      await expect(controller.updateLink(1, 2, 3, 4)).rejects.toThrow("Update link error");
      expect(dao.updateLink).toHaveBeenCalledWith(1, 2, 3, 4);
    });
  });

  describe("getAllLinks", () => {
    test("It should return all links successfully", async () => {
      const mockLink = new Link(1, "Link 1");

      jest.spyOn(dao, 'getAllLinks').mockResolvedValue([mockLink]);

      await expect(controller.getAllLinks()).resolves.toEqual([mockLink]);
      expect(dao.getAllLinks).toHaveBeenCalled();
    });

    test("It should return an empty array if there are no links", async () => {

      jest.spyOn(dao, 'getAllLinks').mockResolvedValue([]);

      await expect(controller.getAllLinks()).resolves.toEqual([]);
      expect(dao.getAllLinks).toHaveBeenCalled();
    });


    test("It should handle errors from LinkDAO when retrieving all links", async () => {
      jest.spyOn(dao, 'getAllLinks').mockRejectedValue(new Error("Get all links error"));

      await expect(controller.getAllLinks()).rejects.toThrow("Get all links error");
      expect(dao.getAllLinks).toHaveBeenCalled();

    });
  });
});
