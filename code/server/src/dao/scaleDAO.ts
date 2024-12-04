//import { resolve } from "path"
import db from "../db/db"
import Scale from "../models/scale"
import {ScaleAlreadyExistsError, ScaleNotFoundError} from "../errors/scale";

class ScaleDAO {
    getScales(): Promise<Scale[]> {
        return new Promise<Scale[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM scales";
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);
                    if (!rows || rows.length === 0) return reject(new ScaleNotFoundError);

                    const scales: Scale[] = rows.map((row: any) => new Scale(row.id, row.name));
                    resolve(scales);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    addScale(name: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try{
                const sql = "INSERT INTO scales (name) VALUES (?)";
                db.run(sql, [name], function (err: Error | null) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            } catch(error) {
                reject(error);
            }
        });
    }
     
}
export { ScaleDAO }