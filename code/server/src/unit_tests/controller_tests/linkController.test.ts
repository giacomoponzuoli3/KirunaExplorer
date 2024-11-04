import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { LinkController } from "../../src/controllers/linkController";
import { LinkDAO } from "../../src/dao/linkDAO"; // Ensure this import remains as per your requirement
import Link from "../../src/models/link";

// Mock the LinkDAO class
jest.mock("../../src/dao/linkDAO", () => {
  return {
    __esModule: true,
    LinkDAO: jest.fn().mockImplementation(() => ({
      addLink: jest.fn(),
      deleteLinks: jest.fn(),
      updateLink: jest.fn(),
      getAllLinks: jest.fn(),
    })),
  };
});

describe("LinkController", () => {
  let linkController: LinkController;
  let linkDAOInstance: jest.Mocked<LinkDAO>;

  beforeEach(() => {
    // Create a new instance of the mocked LinkDAO
    linkDAOInstance = new (LinkDAO as jest.Mock)() as jest.Mocked<LinkDAO>;

    // Initialize LinkController without passing the DAO instance
    linkController = new LinkController(); // No arguments passed

    // Assign the mocked instance to LinkDAO's prototype
    (LinkDAO as jest.Mock).mockImplementation(() => linkDAOInstance);

    jest.clearAllMocks(); // Clear mock history before each test
  });

  describe("deleteLink", () => {
    test("It should successfully delete a link", async () => {
      // Mock the deleteLinks method to resolve successfully
      linkDAOInstance.deleteLinks.mockResolvedValueOnce(undefined);

      await expect(linkController.deleteLink(1, 2, 3)).resolves.toBeUndefined();
      expect(linkDAOInstance.deleteLinks).toHaveBeenCalledWith(1, 2, 3);
    });

    test("It should handle errors from LinkDAO when deleting a link", async () => {
      // Mock the deleteLinks method to throw an error
      linkDAOInstance.deleteLinks.mockRejectedValueOnce(new Error("Delete link error"));

      await expect(linkController.deleteLink(1, 2, 3)).rejects.toThrow("Delete link error");
      expect(linkDAOInstance.deleteLinks).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe("updateLink", () => {
    test("It should successfully update a link", async () => {
      // Mock the updateLink method to resolve successfully
      linkDAOInstance.updateLink.mockResolvedValueOnce(undefined);

      await expect(linkController.updateLink(1, 2, 3, 4)).resolves.toBeUndefined();
      expect(linkDAOInstance.updateLink).toHaveBeenCalledWith(1, 2, 3, 4);
    });

    test("It should handle errors from LinkDAO when updating a link", async () => {
      // Mock the updateLink method to throw an error
      linkDAOInstance.updateLink.mockRejectedValueOnce(new Error("Update link error"));

      await expect(linkController.updateLink(1, 2, 3, 4)).rejects.toThrow("Update link error");
      expect(linkDAOInstance.updateLink).toHaveBeenCalledWith(1, 2, 3, 4);
    });
  });

  describe("getAllLinks", () => {
    test("It should return all links successfully", async () => {
      const mockLinks = [new Link(1, "Link 1"), new Link(2, "Link 2")];
      // Mock the getAllLinks method to resolve with mock links
      linkDAOInstance.getAllLinks.mockResolvedValueOnce(mockLinks);

      const links = await linkController.getAllLinks();
      expect(links).toEqual(mockLinks);
      expect(linkDAOInstance.getAllLinks).toHaveBeenCalled();
    });

    test("It should handle errors from LinkDAO when retrieving all links", async () => {
      // Mock the getAllLinks method to throw an error
      linkDAOInstance.getAllLinks.mockRejectedValueOnce(new Error("Get all links error"));

      await expect(linkController.getAllLinks()).rejects.toThrow("Get all links error");
      expect(linkDAOInstance.getAllLinks).toHaveBeenCalled();
    });
  });
});
