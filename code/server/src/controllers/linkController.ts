import { LinkDAO } from "../dao/linkDAO";
import Link from "../models/link";

class LinkController {
    private dao: LinkDAO;

    constructor() {
        this.dao = new LinkDAO();
    }

    /**
     * Adds a link to the database.
     * @param idDoc1 The ID of the first document.
     * @param idDoc2 The ID of the second document.
     * @param name The name of the link to add.
     * @returns A Promise that resolves when the link has been added.
     */
    async addLink(idDoc1: number, idDoc2: number, name: string): Promise<void> {
        await this.dao.addLink(idDoc1, idDoc2, name);
    }

    /**
     * Deletes a link from the database.
     * @param linkId The id of the link to delete.
     * @returns A Promise that resolves when the link has been deleted.
     */
    async deleteLink(linkId: number) {
        await this.dao.deleteLinks(linkId);
    }

    /**
     * Updates a link in the database.
     * @param id The id of the link to update.
     * @param name The new name of the link.
     * @returns A Promise that resolves when the link has been updated.
     */
    async updateLink(id: number, name: string) {
        await this.dao.updateLink(id, name);
    }

    /**
     * Retrieves a link by its id from the database.
     * @param id The id of the link to retrieve.
     * @returns A Promise that resolves to the link with the specified id.
     */
    async getLinkById(id: number): Promise<Link> {
        return await this.dao.getLinkById(id);
    }

    /**
     * Retrieves all links from the database.
     * @returns A Promise that resolves to an array of Link objects.
     */
    async getAllLinks(): Promise<Link[]> {
        return await this.dao.getAllLinks();
    }
}

export { LinkController }