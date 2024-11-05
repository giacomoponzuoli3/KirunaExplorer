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
}

export default StakeholderController