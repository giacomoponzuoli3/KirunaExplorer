import { ScaleDAO } from "../dao/scaleDAO";
import Scale from "../models/scale";

class ScaleController {
    private dao: ScaleDAO;

    constructor() {
        this.dao = new ScaleDAO();
    }

    /**
     * Retrieves all scales from the database.
     * @returns A Promise that resolves to an array of Scale objects.
     */
    async getScales(): Promise<Scale[]> {
        return await this.dao.getScales();
    }
    
    /**
     * Adds a scale to the database.
     * @param name the scale to be added
     * @returns A Promise that resolves when the scale has been added.
     */
    async addScale(name: string): Promise<number> {
        return await this.dao.addScale(name);
    }
    

}

export { ScaleController }