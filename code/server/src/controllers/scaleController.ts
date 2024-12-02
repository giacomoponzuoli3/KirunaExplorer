import { ScaleDAO } from "../dao/scaleDAO";
import Scale from "../models/scale";

class ScaleController {
    private dao: ScaleDAO;

    constructor() {
        this.dao = new ScaleDAO();
    }

    /**
     * Retrieves all scales from the database.
     * @returns A Promise that resolves when the scale has been added.
     */
    async getScales(): Promise<Scale[]> {
        return await this.dao.getScales();
    }
    
    /**
     * Adds a scale to the database.
     * @param name
     * @returns A Promise that resolves to an array of Scale objects.
     */
    
    
    
    /**
     * Adds a link to the database.
     * @param idDoc1 - The ID of the first document.
     * @param idDoc2 - The ID of the second document.
     * @param idLink - The ID of the link type.
     * @returns A Promise that resolves when the link has been added.
     
    async addLink(idDoc1: number, idDoc2: number, idLink: number): Promise<void> {
        await this.dao.addLink(idDoc1, idDoc2, idLink);
    }
    */
}

export { ScaleController }