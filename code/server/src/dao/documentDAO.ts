import { DocLink } from "../models/document_link";
import db from "../db/db"
import { Document } from "../models/document"
import { Stakeholder } from "../models/stakeholder"

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
    addDocument(title: string, stakeHolders: number[], scale: string, issuanceDate: string, type: string, language: string|null, pages: string|null, description: string|null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                // Step 1: Insert the document
                const sql = "INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)";
                db.run(sql, [title, scale, issuanceDate, type, language, pages, description], function (err: Error | null) {
                    if (err) {
                        reject(err);
                        return;
                    }
    
                    const documentId = this.lastID;  // The ID of the inserted document
    
                    // Step 2: Insert entries into stakeholders_documents table
                    const stakeholderSql = "INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)";
                    const stakeholderInserts = stakeHolders.map(stakeHolderId => 
                        new Promise<void>((resolveInsert, rejectInsert) => {
                            db.run(stakeholderSql, [documentId, stakeHolderId], (err: Error | null) => {
                                if (err) {
                                    rejectInsert(err);
                                } else {
                                    resolveInsert();
                                }
                            });
                        })
                    );
    
                    // Step 3: Wait for all stakeholder insertions to complete
                    Promise.all(stakeholderInserts)
                        .then(() => resolve())
                        .catch(error => reject(error));
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
                const sql = `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id WHERE d.id = ?`;
    
                db.all(sql, [id], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!rows || rows.length === 0) {
                        reject(new Error("Document not found."));
                        return;
                    }
    
                    // Initialize document with the first row's data
                    const row = rows[0];
                    const document: Document = new Document(
                        row.id,
                        row.title,
                        [], // Placeholder for stakeholders, populated below
                        row.scale,
                        row.issuance_date,
                        row.type,
                        row.language,
                        row.pages,
                        row.description
                    );
    
                    // Populate stakeholders
                    document.stakeHolders = rows.map(row => new Stakeholder(
                        row.stakeholder_id,
                        row.stakeholder_name,
                        row.stakeholder_category
                    ));
    
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
                const sql = `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id`;
    
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!rows || rows.length === 0) {
                        reject(new Error("No documents found."));
                        return;
                    }
    
                    // Group rows by document and map stakeholders to each document
                    const documentsMap = new Map<number, Document>();
                    rows.forEach((row: any) => {
                        const documentId = row.id;
                        if (!documentsMap.has(documentId)) {
                            documentsMap.set(documentId, new Document(
                                row.id,
                                row.title,
                                [],  // Placeholder for stakeholders, populated below
                                row.scale,
                                row.issuance_date,
                                row.type,
                                row.language,
                                row.pages,
                                row.description
                            ));
                        }
    
                        // Add stakeholder (always available) to the document's stakeholders array
                        const stakeholder = new Stakeholder(row.stakeholder_id, row.stakeholder_name, row.stakeholder_category);
                        documentsMap.get(documentId)?.stakeHolders.push(stakeholder);
                    });
    
                    // Convert map values to array
                    const documents = Array.from(documentsMap.values());
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
    editDocument(id: number,title: string,stakeHolders: number[],scale: string,issuanceDate: string,type: string,language: string | null,pages: string | null,description: string | null
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const updateDocumentSql = "UPDATE documents SET title = ?, scale = ?, issuance_date = ?, type = ?, language = ?, pages = ?, description = ? WHERE id = ?";
            const values = [
                title,
                scale,
                issuanceDate,
                type,
                language,
                pages,
                description,
                id
            ];
    
            db.run(updateDocumentSql, values, (err: Error | null) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
                // Step 1: Delete existing stakeholder associations for this document
                const deleteStakeholdersSql = "DELETE FROM stakeholders_documents WHERE id_document = ?";
                db.run(deleteStakeholdersSql, [id], (deleteErr: Error | null) => {
                    if (deleteErr) {
                        console.log(deleteErr);
                        reject(deleteErr);
                        return;
                    }
    
                    // Step 2: Insert new stakeholder associations
                    const insertStakeholderSql = "INSERT INTO stakeholders_documents (id_document, id_stakeholder) VALUES (?, ?)";
                    const stakeholderInserts = stakeHolders.map(stakeholderId =>
                        new Promise<void>((resolveInsert, rejectInsert) => {
                            db.run(insertStakeholderSql, [id, stakeholderId], (insertErr: Error | null) => {
                                if (insertErr) {
                                    rejectInsert(insertErr);
                                } else {
                                    resolveInsert();
                                }
                            });
                        })
                    );
    
                    // Step 3: Wait for all stakeholder insertions to complete
                    Promise.all(stakeholderInserts)
                        .then(() => resolve())
                        .catch(error => reject(error));
                });
            });
        });
    }

    getDocumentLinksById(id: number): Promise<DocLink[]> {
        return new Promise<DocLink[]>((resolve, reject) => {
            try {
                const sql = `SELECT dl.*, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?`;
                db.all(sql, [id, id], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);
                    if (!rows || rows.length === 0) return reject(new Error("No links found."));
    
                    const documents2RelatedIds: number[] = rows.map(row => row.id_document2);
                    const documents1RelatedIds: number[] = rows.map(row => row.id_document1);
                    const combinedIds: number[] = Array.from(new Set([...documents2RelatedIds, ...documents1RelatedIds]));
                    const filteredIds: number[] = combinedIds.filter(idValue => idValue != id);

                    const sqlDocs = "SELECT * FROM documents WHERE id IN (?)";
                    db.all(sqlDocs, filteredIds, (err: Error | null, documentRows: any[]) => {
                        if (err) return reject(err);
                        console.log(documentRows);
                        if (!documentRows || documentRows.length === 0) return reject(new Error("No documents found."));

                        const documentPromises = documentRows.map(row => {
                            const relatedLink = rows.find(linkRow =>
                                (linkRow.id_document1 === row.id || linkRow.id_document2 === row.id) && linkRow.id_link
                            );
                            console.log(relatedLink);
                            return new Promise<DocLink>((resolveDoc, rejectDoc) => {
                                const sqlStakeholders = `SELECT sd.id_stakeholder, s.name, s.category FROM stakeholders_documents sd JOIN stakeholders s ON s.id = sd.id_stakeholder WHERE id_document = ?`;
                                db.all(sqlStakeholders, [row.id], (err: Error | null, stakeholderRows: any[]) => {
                                    if (err) return rejectDoc(err);
                                    
                                    const stakeholders = stakeholderRows ? stakeholderRows.map(stakeholderRow =>
                                        new Stakeholder(stakeholderRow.id_stakeholder, stakeholderRow.name, stakeholderRow.category)
                                    ) : [];
    
                                    resolveDoc(new DocLink(
                                        row.id,
                                        row.title,
                                        stakeholders,
                                        row.scale,
                                        row.issuance_date,
                                        row.type,
                                        row.language,
                                        row.pages,
                                        row.description,
                                        relatedLink.link_name 
                                    ));
                                });
                            });
                        });
    
                        Promise.all(documentPromises)
                            .then(documents => resolve(documents))
                            .catch(reject);
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }    

    /**
     * Retrieves the title of a document by its id from the database.
     * @param id The id of the document to retrieve.
     * @returns A Promise that resolves to the title of document with the specified id.
     */

    getDocumentTitleById(id: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                const sql = "SELECT title FROM documents WHERE id = ?";
                db.get(sql, [id], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!row) {
                        reject(new Error("Document not found."));
                        return;
                    }
                    resolve(row.title);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

     /**
     * Retrieves the description of a document by its id from the database.
     * @param id The id of the document to retrieve.
     * @returns A Promise that resolves to the the description of document with the specified id.
     */

    getDocumentDescriptionById(id: number): Promise<string | null> {
        return new Promise<string | null>((resolve, reject) => {
            try {
                const sql = "SELECT description FROM documents WHERE id = ?";
                db.get(sql, [id], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!row) {
                        reject(new Error("Document not found."));
                        return;
                    }
                    resolve(row.description ?? null);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves the issuanceDate of a document by its id from the database.
     * @param id The id of the document to retrieve.
     * @returns A Promise that resolves to the the issuanceDate of document with the specified id.
     */

    getDocumentIssuanceDateById(id: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                const sql = "SELECT issuanceDate FROM documents WHERE id = ?";
                db.get(sql, [id], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!row) {
                        reject(new Error("Document not found."));
                        return;
                    }
                    resolve(row.issuanceDate);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    
    /**
     * Retrieves all documents of the same type from the database.
     * @param type The type of the document to retrieve.
     * @returns A Promise that resolves to an array of Document objects.
     */

    getAllDocumentsOfSameType(type: string): Promise<Document[]> {
        return new Promise<Document[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM documents WHERE type = ?";
                db.all(sql, [type], (err: Error | null, rows: any[]) => {
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
    

}



export {DocumentDAO}