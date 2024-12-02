import { Document } from "../models/document";
import { DocumentDAO } from "../dao/documentDAO";
import { DocLink } from "../models/document_link";
import { Stakeholder } from "../models/stakeholder";

class DocumentController {
    private dao: DocumentDAO;

    constructor() {
        this.dao = new DocumentDAO();
    }

    
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
    addDocument(title: string, stakeHolders: Stakeholder[], scale: string, issuanceDate: string, type: string, language: string, pages: string, description: string): Promise<Document> {
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
     * @param stakeHolders The updated stakeholders of the document.
     * @param scale The new scale of the document.
     * @param issuanceDate The updated issuance date of the document.
     * @param type The new type of the document.
     * @param language The updated language of the document.
     * @param pages The new pages of the document.
     * @param description The updated description of the document.
     * @returns A Promise that resolves when the document has been updated.
     */
    editDocument(id: number, title: string, stakeHolders: Stakeholder[], scale: string, issuanceDate: string, type: string, language: string, pages: string, description: string): Promise<Document> {
        return this.dao.editDocument(id, title, stakeHolders, scale, issuanceDate, type, language, pages, description);
    }

    /**
     * Retrieves documents linked to a specified document by its id.
     * @param id The id of the document whose linked documents are to be retrieved.
     * @returns A Promise that resolves to an array of Document objects linked to the specified document.
     */
    getDocumentLinksById(id: number): Promise<DocLink[]> {
        return this.dao.getDocumentLinksById(id);
    }

    
    /**
     * Retrieves the title of a document by its id from the database.
     * @param id The id of the document to retrieve.
     * @returns A Promise that resolves to the title of document with the specified id.
     */
    getDocumentTitleById(id: number): Promise<string> {
        return this.dao.getDocumentTitleById(id);
    }

     /**
     * Retrieves the description of a document by its id from the database.
     * @param id The id of the document to retrieve.
     * @returns A Promise that resolves to the description of document with the specified id.
     */

    getDocumentDescriptionById(id: number): Promise<string> {
        return this.dao.getDocumentDescriptionById(id)
    }

    /**
     * Retrieves the issuanceDate of a document by its id from the database.
     * @param id The id of the document to retrieve.
     * @returns A Promise that resolves to the issuanceDate of document with the specified id.
     */

    getDocumentIssuanceDateById(id: number): Promise<string> {
        return this.dao.getDocumentIssuanceDateById(id);
    }

    /**
     * Retrieves all documents of the same type from the database.
     * @param type The type of the document to retrieve.
     * @returns A Promise that resolves to an array of Document objects.
     */

    getAllDocumentsOfSameType(type: string): Promise<Document[]> {
        return this.dao.getAllDocumentsOfSameType(type);
    }


    /**
     * Adds a resource to the specified document in the database.
     * @param documentId The id of the document to add the resource to.
     * @param name The name of the resource to add.
     * @param data The data of the resource to add.
     * @returns A Promise that resolves when the resource has been added.
     */
    addResourceToDocument(documentId: number, name: string, data: Uint8Array): Promise<void> {
        return this.dao.addResourceToDocument(documentId, name, data);
    }

    /**
     * Retrieves the resource data associated with the specified document from the database.
     * @param documentId The id of the document whose resource data is to be retrieved.
     * @returns A Promise that resolves to the resource data associated with the document.
     */
    getResourceData(documentId: number): Promise<Uint8Array> {
        return this.dao.getResourceData(documentId);
    }

    /**
     * Deletes a resource associated with a document from the database.
     * @param documentId The id of the document whose resource is to be deleted.
     * @param name The name of the resource to delete.
     * @returns A Promise that resolves when the resource has been deleted.
     */
    deleteResource(documentId: number, name: string): Promise<void> {
        return this.dao.deleteResource(documentId, name);
    }

}

export default DocumentController