import { StakeholderDAO } from "../dao/stakeholderDAO";
import { Stakeholder } from "../models/stakeholder";

class StakeholderController {
    private dao: StakeholderDAO;

    constructor() {
        this.dao = new StakeholderDAO();
    }

    /**
     * Retrieves all stakeholders from the database.
     * @returns A Promise that resolves to an array of Stakeholders objects.
     */
    getAllStakeholders(): Promise<Stakeholder[]> {
        return this.dao.getAllStakeholders();
    }

    /**
     * Adds a stakeholder to the database.
     * @param name The name of the stakeholder to add.
     * @param category The category of the stakeholder to add.
     * @returns A Promise that resolves when the stakeholder has been added.
     */
    addStakeholder(name: string, category: string): Promise<Number> {
        return this.dao.addStakeholder(name, category);
    }
}

export default StakeholderController