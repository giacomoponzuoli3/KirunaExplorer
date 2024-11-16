import db from "../db/db"
import { Stakeholder } from "../models/stakeholder"
import {StakeholderNotFoundError} from "../errors/stakeholder";

class StakeholderDAO {
    
    getAllStakeholders(): Promise<Stakeholder[]> {
        return new Promise<Stakeholder[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM stakeholders";
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);
                    if (!rows || rows.length === 0) return reject(new StakeholderNotFoundError);

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