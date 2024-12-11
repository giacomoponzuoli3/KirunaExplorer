//import { resolve } from "path"
import db from "../db/db"
import DocType from "../models/type"
import {TypeNotFoundError} from "../errors/type";

class TypeDAO {
    getTypes(): Promise<DocType[]> {
        return new Promise<DocType[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM types";
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);
                    if (!rows || rows.length === 0) return reject(new TypeNotFoundError);

                    const types: DocType[] = rows.map((row: any) => new DocType(row.type_id, row.name));
                    resolve(types);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    addType(name: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try{
                const sql = "INSERT INTO types (name) VALUES (?)";
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
export { TypeDAO }