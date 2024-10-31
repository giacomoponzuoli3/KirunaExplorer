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
    async addLink(idDoc1: number, idDoc2: number, idLink: number): Promise<void> {
        await this.dao.addLink(idDoc1, idDoc2, idLink);
    }

    /**
     * Deletes a link from the database.
     * @param linkId The id of the link to delete.
     * @returns A Promise that resolves when the link has been deleted.
     */
    async deleteLink(idDoc1: number, idDoc2: number, linkId: number) {
        await this.dao.deleteLinks(idDoc1, idDoc2, linkId);
    }

    /**
     * Updates a link in the database.
     * @param id The id of the link to update.
     * @param name The new name of the link.
     * @returns A Promise that resolves when the link has been updated.
     */
    async updateLink(idDoc1: number, idDoc2: number, oldLinkId: number, newLinkId: number) {
        await this.dao.updateLink(idDoc1, idDoc2, oldLinkId, newLinkId);
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