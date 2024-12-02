import { DocLink } from "../models/document_link";
import db from "../db/db"
import { Document } from "../models/document"
import { Stakeholder } from "../models/stakeholder"
import Link from "../models/link";
import {DocumentNotFoundError} from "../errors/document";

class DocumentDAO {
    /**
     * Adds a document to the database.
     * @param title The title of the document to add.
     * @param stakeHolders The stakeholders of the document to add.
     * @param scale The scale of the document to add.
     * @param issuanceDate The issuance date of the document to add.
     * @param type The type of the document to add.
     * @param language The language of the document to add.
     * @param pages The pages of the document to add.
     * @param description The description of the document to add.
     * @returns A Promise that resolves when the document has been added.
     */
    addDocument(title: string, stakeHolders: Stakeholder[], scale: string, issuanceDate: string, type: string, language: string|null, pages: string|null, description: string): Promise<Document> {
        return new Promise<Document>(async (resolve, reject) => {
            try {
                // Step 1: Insert the document
                const documentId = await new Promise<number>((resolve, reject) => {
                    const sql = "INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)";

                    db.run(sql, [title, scale, issuanceDate, type, language, pages, description], function (err: Error | null) {
                        if (err) return reject(err);

                        resolve(this.lastID);
                    })
                })

                const stakeholderSql = "INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)";
                const stakeholderInserts = stakeHolders.map(stakeHolder =>
                    new Promise<void>((resolveInsert, rejectInsert) => {
                        db.run(stakeholderSql, [documentId, stakeHolder.id], (err: Error | null) => {
                            if (err) rejectInsert(err);
                            else resolveInsert();
                        });
                    })
                );

                const doc = new Document(documentId, title, stakeHolders, scale, issuanceDate, type, language, pages, description);

                // Step 3: Wait for all stakeholder insertions to complete
                Promise.all(stakeholderInserts)
                    .then(() => resolve(doc))
                    .catch(error => reject(error));
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
                    if (err) return reject(err);
                    if (!rows || rows.length === 0) return reject(new DocumentNotFoundError);

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
                    if (err) return reject(err);
                    if (!rows || rows.length == 0) return resolve([]);

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
                    if (err) return reject(err);

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
     * @param stakeHolders The stakeholders of the document to update.
     * @param scale The scale of the document to update.
     * @param issuanceDate The issuance date of the document to update.
     * @param type The type of the document to update.
     * @param language The language of the document to update.
     * @param pages The pages of the document to update.
     * @param description The description of the document to update.
     * @returns A Promise that resolves when the document has been updated.
     */
    editDocument(id: number, title: string, stakeHolders: Stakeholder[], scale: string, issuanceDate: string, type: string, language: string | null, pages: string | null, description: string): Promise<Document> {
        return new Promise<Document>(async (resolve, reject) => {
            try {
                // Step 1: Edit document information (except stakeholders).
                const updateDocumentSql = "UPDATE documents SET title = ?, scale = ?, issuance_date = ?, type = ?, language = ?, pages = ?, description = ? WHERE id = ?";
                const values = [title, scale, issuanceDate, type, language, pages, description, id];
                await new Promise<void>((resolve, reject) => {
                    db.run(updateDocumentSql, values, (err: Error | null) => {
                        if (err) return reject(err);

                        resolve();
                    })
                })

                // Step 2: Delete existing stakeholder associations for this document
                const deleteStakeholdersSql = "DELETE FROM stakeholders_documents WHERE id_document = ?";
                await new Promise<void>((resolve, reject) => {
                    db.run(deleteStakeholdersSql, [id], (deleteErr: Error | null) => {
                        if (deleteErr) return reject(deleteErr);

                        resolve();
                    })
                })

                // Step 2: Insert new stakeholder associations
                const insertStakeholderSql = "INSERT INTO stakeholders_documents (id_document, id_stakeholder) VALUES (?, ?)";
                const stakeholderInserts = stakeHolders.map(stakeholder =>
                    new Promise<void>((resolveInsert, rejectInsert) => {
                        db.run(insertStakeholderSql, [id, stakeholder.id], (insertErr: Error | null) => {
                            if (insertErr) rejectInsert(insertErr);
                            else resolveInsert();
                        });
                    })
                );

                const doc = new Document(id, title, stakeHolders, scale, issuanceDate, type, language, pages, description);

                // Step 3: Wait for all stakeholder insertions to complete
                Promise.all(stakeholderInserts)
                    .then(() => resolve(doc))
                    .catch(error => reject(error));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves all the document related to a given one.
     * @param id - The id of the document to retrieve the links for.
     */
    getDocumentLinksById(id: number): Promise<DocLink[]> {
        return new Promise<DocLink[]>(async (resolve, reject) => {
            try {
                const sql = `SELECT dl.id_document1, dl.id_document2, l.id AS link_id, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?`;
                const rows = await new Promise<any[]>((resolve, reject) => {
                    db.all(sql, [id, id], (err: Error | null, rows: any[]) => {
                        if (err) return reject(err);
                        if (!rows || rows.length === 0) return resolve([]);

                        resolve(rows);
                    })
                })

                // Estrarre una lista di documenti correlati con i rispettivi link_name
                const relatedDocs = rows.map(row => ({
                    id: row.id_document1 == id ? row.id_document2 : row.id_document1,
                    link_name: row.link_name,
                    link_id: row.link_id
                }));

                    // Costruire le promesse per ogni documento correlato
                const documentPromises = relatedDocs.map(({ id: docId, link_name, link_id }) => {
                    return new Promise<DocLink>(async (resolveDoc, rejectDoc) => {
                        // Query per ottenere i dati del documento

                        const sqlDoc = `SELECT * FROM documents WHERE id = ?`;
                        const documentRow = await new Promise<any>((resolve, reject) => {
                            db.get(sqlDoc, [docId], (err: Error | null, documentRow: any) => {
                                if (err) return rejectDoc(err);
                                if (!documentRow) return rejectDoc(new DocumentNotFoundError);

                                resolve(documentRow);
                            })
                        })

                        // Query per ottenere gli stakeholder associati
                        const sqlStakeholders = `SELECT sd.id_stakeholder, s.name, s.category FROM stakeholders_documents sd JOIN stakeholders s ON s.id = sd.id_stakeholder WHERE id_document = ?`;
                        const stakeholderRows: any[] = await new Promise<any[]>((resolve, reject) => {
                            db.all(sqlStakeholders, [docId], (err: Error | null, stakeholderRows: any[]) => {
                                if (err) return rejectDoc(err);

                                resolve(stakeholderRows);
                            })
                        })

                        // Creiamo la lista degli stakeholder
                        const stakeholders = stakeholderRows ? stakeholderRows.map(stakeholderRow =>
                            new Stakeholder(stakeholderRow.id_stakeholder, stakeholderRow.name, stakeholderRow.category)
                        ) : [];

                        // Creiamo l'oggetto DocLink
                        resolveDoc(new DocLink(
                            documentRow.id,
                            documentRow.title,
                            stakeholders,
                            documentRow.scale,
                            documentRow.issuance_date,
                            documentRow.type,
                            documentRow.language,
                            documentRow.pages,
                            documentRow.description,
                            new Link(link_id, link_name) // Assegniamo direttamente il nome del link
                        ));
                    });
                });

                // Risolviamo tutte le promesse e otteniamo l'array di DocLink
                Promise.all(documentPromises)
                    .then(documents => resolve(documents))
                    .catch(reject);
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
                    if (err) return reject(err);
                    if (!row) return reject(new DocumentNotFoundError);

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
     * @returns A Promise that resolves to the description of document with the specified id.
     */
    getDocumentDescriptionById(id: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                const sql = "SELECT description FROM documents WHERE id = ?";
                db.get(sql, [id], (err: Error | null, row: any) => {
                    if (err) return reject(err);
                    if (!row) return reject(new DocumentNotFoundError);

                    resolve(row.description ?? "No description available...");
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves the issuanceDate of a document by its id from the database.
     * @param id The id of the document to retrieve.
     * @returns A Promise that resolves to the issuanceDate of document with the specified id.
     */
    getDocumentIssuanceDateById(id: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                const sql = "SELECT issuance_date FROM documents WHERE id = ?";
                db.get(sql, [id], (err: Error | null, row: any) => {
                    if (err) return reject(err);
                    if (!row) return reject(new DocumentNotFoundError);

                    resolve(row.issuance_date);
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
                const sql = `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id WHERE d.type = ?`;
                db.all(sql, [type], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);
                    if (!rows || rows.length == 0) return resolve([]);

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
     * Adds a resource to the specified document in the database.
     * @param documentId The id of the document to add the resource to.
     * @param name The name of the resource to add.
     * @param data The data of the resource to add.
     * @returns A Promise that resolves when the resource has been added.
     */
    addResourceToDocument(documentId: number, name: string, data: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                // Decodifica la stringa Base64 in binario
                const decodedData = Buffer.from(data, 'base64');
    
                // Query SQL per inserire i dati
                const sql = "INSERT INTO original_resources (document_id, resource_name, resource_data) VALUES (?, ?, ?)";
                db.run(sql, [documentId, name, decodedData], (err: Error | null) => {
                    if (err) return reject(err);
                    resolve();
                });
            } catch (error) {
                reject(error);
                console.error(error);
            }
        });
    }
    
    /**
     * Retrieves the resource data associated with the specified document from the database.
     * @param documentId The id of the document whose resource data is to be retrieved.
     * @returns A Promise that resolves to the resource data associated with the document.
     */
    getResourceData(documentId: number): Promise<Uint8Array> {
        return new Promise<Uint8Array>((resolve, reject) => {
            try {
                const sql = "SELECT resource_data FROM original_resources WHERE document_id = ?";
                db.get(sql, [documentId], (err: Error | null, row: any) => {
                    if (err) return reject(err);
                    if (!row) return reject(new DocumentNotFoundError);

                    // Return the resource data associated with the document
                    resolve(row.resource_data);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes a resource associated with a document from the database.
     * @param documentId The id of the document whose resource is to be deleted.
     * @param name The name of the resource to delete.
     * @returns A Promise that resolves when the resource has been deleted.
     */
    deleteResource(documentId: number, name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "DELETE FROM original_resources WHERE document_id = ? AND resource_name = ?";
                db.run(sql, [documentId, name], (err: Error | null) => {
                    if (err) return reject(err);
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

}

export { DocumentDAO }