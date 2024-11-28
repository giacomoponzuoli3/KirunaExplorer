import db from "../db/db"
import { Stakeholder } from "../models/stakeholder"
import {StakeholderNotFoundError} from "../errors/stakeholder";

class StakeholderDAO {
    
    /**
     * Retrieves all stakeholders from the database.
     * @returns A Promise that resolves to an array of Stakeholders objects.
     */
    getAllStakeholders(): Promise<Stakeholder[]> {
        return new Promise<Stakeholder[]>((resolve, reject) => {
            try {
                // Query to retrieve all stakeholders
                const sql = "SELECT * FROM stakeholders";

                // Execute the query
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);
                    if (!rows || rows.length === 0) return reject(new StakeholderNotFoundError);

                    // Map rows to Stakeholder instances
                    const stakeholders: Stakeholder[] = rows.map(row => new Stakeholder(
                        row.id,
                        row.name,
                        row.category
                    ));

                    // Resolve the promise with the array of stakeholders
                    resolve(stakeholders);
                });
            } catch (error) {
                reject(error);
            }
        });
    }


    /**
     * Adds a stakeholder to the database.
     * @param name The name of the stakeholder to add.
     * @param category The category of the stakeholder to add.
     * @returns A Promise that resolves when the stakeholder has been added.
     */
    addStakeholder(name: string, category: string): Promise<Number> {
        return new Promise<Number>((resolve, reject) => {
            try {
                // Insert the stakeholder into the database
                const sql = "INSERT INTO stakeholders(name, category) VALUES(?, ?)";
                db.run(sql, [name, category], function (err: Error | null) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

}



export {StakeholderDAO}