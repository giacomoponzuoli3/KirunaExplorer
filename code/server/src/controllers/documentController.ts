import { Document } from "../models/document";
import { DocumentDAO } from "../dao/documentDAO";

class DocumentController {
    private dao: DocumentDAO;

    constructor() {
        this.dao = new DocumentDAO();
    }

    
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
    addDocument(title: string, stakeHolders: string, scale: string, issuanceDate: string, type: string, language: string, pages: string, description: string): Promise<void> {
        return this.dao.addDocument(title, stakeHolders, scale, issuanceDate, type, language, pages, description);
    }

    /**
     * Retrieves a document by its id from the database. 
     * @param id The id of the document to retrieve.
     * @returns A Promise that resolves to the document with the specified id.
     */
    getDocumentById(id: number): Promise<Document> {
        return this.dao.getDocumentById(id);
    }

    /**
     * Retrieves all documents from the database.
     * @returns A Promise that resolves to an array of Document objects.
     */
    getAllDocuments(): Promise<Document[]> {
        return this.dao.getAllDocuments();
    }

    /**
     * Deletes a document from the database.
     * @param id The id of the document to delete.
     * @returns A Promise that resolves when the document has been deleted.
     */
    deleteDocument(id: number): Promise<void> {
        return this.dao.deleteDocument(id);
    }

    /**
     * Edits a document in the database.
     * @param id The id of the document to edit.
     * @param title The new title of the document.
     * @param stakeHolders The updated stake holders of the document.
     * @param scale The new scale of the document.
     * @param issuanceDate The updated issuance date of the document.
     * @param type The new type of the document.
     * @param language The updated language of the document.
     * @param pages The new pages of the document.
     * @param description The updated description of the document.
     * @returns A Promise that resolves when the document has been updated.
     */
    editDocument(id: number, title: string, stakeHolders: string, scale: string, issuanceDate: string, type: string, language: string, pages: string, description: string): Promise<void> {
        return this.dao.editDocument(id, title, stakeHolders, scale, issuanceDate, type, language, pages, description);
    }

    /**
     * Retrieves documents linked to a specified document by its id.
     * @param id The id of the document whose linked documents are to be retrieved.
     * @returns A Promise that resolves to an array of Document objects linked to the specified document.
     */
    getDocumentLinksById(id: number): Promise<Document[]> {
        return this.dao.getDocumentLinksById(id);
    }
}

export default DocumentController