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

    /**
     * getAllLinks(): Promise<Link[]> {
        return new Promise<Link[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM links";
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);
                    if (!rows || rows.length === 0) return reject(new LinkNotFoundError);

                    const links: Link[] = rows.map((row: any) => new Link(row.id, row.name));
                    resolve(links);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
     */
}
export { ScaleDAO }