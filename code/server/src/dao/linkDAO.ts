import db from "../db/db"
import { Document } from "../models/document"
import Link from "../models/link"

class LinkDAO {
    addLink(idDoc1: number, idDoc2: number, name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sqlInsertLink = "INSERT INTO links(name) VALUES(?)";
                db.run(sqlInsertLink, [name], function (err: Error | null) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const linkId = this.lastID; 
    
                    try {
                        const sqlInsertDocLinks = "INSERT INTO documents_links(id_document1, id_document2, id_link) VALUES(?, ?, ?)";
                        db.run(sqlInsertDocLinks, [idDoc1, idDoc2, linkId], (err: Error | null) => {
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
            } catch (error) {
                reject(error);
            }
        });
    }

    deleteLinks(linkId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sqlDeleteDocLinks = "DELETE FROM documents_links WHERE id_link = ?";
                db.run(sqlDeleteDocLinks, [linkId], function (err: Error | null) {
                    if (err) {
                        reject(err);
                        return;
                    }
    
                    try {
                        const sqlDeleteLink = "DELETE FROM links WHERE id = ?";
                        db.run(sqlDeleteLink, [linkId], (err: Error | null) => {
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
            } catch (error) {
                reject(error); 
            }
        });
    }
    
    updateLink(id: number, name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sqlUpdateLink = "UPDATE links SET name = ? WHERE id = ?";
                db.run(sqlUpdateLink, [name, id], function (err: Error | null) {
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

    getLinkById(id: number): Promise<Link> {
        return new Promise<Link>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM links WHERE id = ?";
                db.get(sql, [id], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!row) {
                        reject(new Error("Link not found."));
                        return;
                    }
                    const link: Link = new Link(row.id, row.name);
                    resolve(link);
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