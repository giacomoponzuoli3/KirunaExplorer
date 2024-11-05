import db from "../db/db"
import Link from "../models/link"

class LinkDAO {
    addLink(idDoc1: number, idDoc2: number, idLink: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sqlCheckLink = `SELECT * FROM documents_links WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`;
                db.all(sqlCheckLink, [idDoc1, idDoc2, idDoc2, idDoc1, idLink], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err)
                    if (rows && rows.length > 0) {
                        return reject(new Error("Link already exists between these documents with the same name."));
                    }
                    
                    const sqlInsertDocLinks = "INSERT INTO documents_links(id_document1, id_document2, id_link) VALUES(?, ?, ?)";
                    db.run(sqlInsertDocLinks, [idDoc1, idDoc2, idLink], (err: Error | null) => {
                        if (err) return reject(err)
                            resolve(); 
                        });
                    });
            } catch (error) {
                reject(error);
            }
        });
    }

    deleteLinks(idDoc1: number, idDoc2: number, linkId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sqlDeleteDocLinks = `DELETE FROM documents_links WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`
                db.run(sqlDeleteDocLinks, [idDoc1, idDoc2, idDoc2, idDoc1, linkId], function (err: Error | null) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            } catch (error) {
                reject(error); 
            }
        });
    }
    
    updateLink(idDoc1: number, idDoc2: number, oldLinkId: number, newLinkId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sqlCheckLink = `SELECT * FROM documents_links WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`;
                db.all(sqlCheckLink, [idDoc1, idDoc2, idDoc2, idDoc1, oldLinkId], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);
    
                    if (!rows || rows.length === 0) {
                        return reject(new Error("Link not found with the specified id."));
                    }
    
                    const sqlUpdateLink = `UPDATE documents_links SET id_link = ? WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`;
                    db.run(sqlUpdateLink, [newLinkId, idDoc1, idDoc2, idDoc2, idDoc1, oldLinkId], function (err: Error | null) {
                        if (err) return reject(err);
    
                        resolve(); 
                    });
                });
            } catch (error) {
                reject(error); 
            }
        });
    }

    getAllLinks(): Promise<Link[]> {
        return new Promise<Link[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM links";
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!rows || rows.length === 0) {
                        reject(new Error("No links found."));
                        return;
                    }
                    const links: Link[] = rows.map((row: any) => new Link(row.id, row.name));
                    resolve(links);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export { LinkDAO }
