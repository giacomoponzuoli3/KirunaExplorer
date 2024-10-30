import db from "../db/db"
import { Document } from "../models/document"
import { Stakeholder } from "../models/stakeholder"

class StakeholderDAO {
    
    getAllStakeholders(): Promise<Stakeholder[]> {
        return new Promise<Stakeholder[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM stakeholders";
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!rows || rows.length === 0) {
                        reject(new Error("No stakeholders found."));
                        return;
                    }
                    
                    // Map rows to Stakeholder instances
                    const stakeholders: Stakeholder[] = rows.map(row => new Stakeholder(
                        row.id,
                        row.name,
                        row.category
                    ));
                    resolve(stakeholders);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    

}



export {StakeholderDAO}