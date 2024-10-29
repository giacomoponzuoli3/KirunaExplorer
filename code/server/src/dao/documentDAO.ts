import db from "../db/db"
import { Document } from "../models/document"

class DocumentDAO {
    /**
     * Adds a document to the database.
     * @param title The title of the document to add.
     * @param stakeHolders The stake holders of the document to add.
     * @param scale The scale of the document to add.
     * @param issuanceDate The issuance date of the document to add.
     * @param type The type of the document to add.
     * @param language The language of the document to add.
     * @param pages The pages of the document to add.
     * @param description The description of the document to add.
     * @returns A Promise that resolves when the document has been added.
     */
    addDocument(title: string, stakeHolders: string, scale: string, issuanceDate: string, type: string, language: string|null, pages: string|null, description: string|null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "INSERT INTO documents(title, stakeholders, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
                db.run(sql, [
                    title,
                    stakeHolders,
                    scale,
                    issuanceDate,
                    type,
                    language,
                    pages,
                    description
                ], (err: Error | null) => {
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

    /**
     * Retrieves a document by its id from the database.
     * @param id The id of the document to retrieve.
     * @returns A Promise that resolves to the document with the specified id.
     */
    getDocumentById(id: number): Promise<Document> {
        return new Promise<Document>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM documents WHERE id = ?";
                db.get(sql, [id], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!row) {
                        reject(new Error("Document not found."));
                        return;
                    }
                    const document: Document = new Document(
                        row.id,
                        row.title,
                        row.stakeholders,
                        row.scale,
                        row.issuance_date,
                        row.type,
                        row.language,
                        row.pages,
                        row.description
                    );
                    console.log(document);
                    resolve(document);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves all documents from the database.
     * @returns A Promise that resolves to an array of Document objects.
     */
    getAllDocuments(): Promise<Document[]> {
        return new Promise<Document[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM documents";
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!rows || rows.length === 0) {
                        reject(new Error("No documents found."));
                        return;
                    }
                    const documents: Document[] = rows.map((row: any) => new Document(
                        row.id,
                        row.title,
                        row.stakeholders,
                        row.scale,
                        row.issuance_date,
                        row.type,
                        row.language,
                        row.pages,
                        row.description
                    ));
                    resolve(documents);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Deletes a document from the database.
     * @param id The id of the document to delete.
     * @returns A Promise that resolves when the document has been deleted.
     */
    deleteDocument(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "DELETE FROM documents WHERE id = ?";
                db.run(sql, [id], (err: Error | null) => {
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

    
    /**
     * Edits a document in the database.
     * @param id The id of the document to edit.
     * @param title The title of the document to update.
     * @param stakeHolders The stake holders of the document to update.
     * @param scale The scale of the document to update.
     * @param issuanceDate The issuance date of the document to update.
     * @param type The type of the document to update.
     * @param language The language of the document to update.
     * @param pages The pages of the document to update.
     * @param description The description of the document to update.
     * @returns A Promise that resolves when the document has been updated.
     */
    editDocument(id: number, title: string, stakeHolders: string, scale: string, issuanceDate: string, type: string, language: string|null, pages: string|null, description: string|null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "UPDATE documents SET title = ?, stakeholders = ?, scale = ?, issuance_date = ?, type = ?, language = ?, pages = ?, description = ? WHERE id = ?";

                const values = [
                    title,
                    stakeHolders,
                    scale,
                    issuanceDate,
                    type,
                    language,
                    pages,
                    description,
                    id
                ];
                
                db.run(sql, values, (err: Error | null) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    }
}

export {DocumentDAO}