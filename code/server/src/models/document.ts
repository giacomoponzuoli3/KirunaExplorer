class Document{
    id: string;
    title: string;
    stakeHolders: string;
    scale: string;
    issuanceDate: string;
    type: string;
    language: string | null;
    pages: string | null;
    description: string | null;

    /**
     * Represents a document in the system.
     * The document is identified by an id, and has a title, stake holders, scale, issuance date, type, language, pages and description.
     * The language, pages and description can be null.
     * @param id The id of the document.
     * @param title The title of the document.
     * @param stakeHolders The stake holders of the document.
     * @param scale The scale of the document.
     * @param issuanceDate The issuance date of the document.
     * @param type The type of the document.
     * @param language The language of the document. Can be null.
     * @param pages The pages of the document. Can be null.
     * @param description The description of the document. Can be null.
     */
    constructor(id: string, title: string, stakeHolders: string, scale: string, issuanceDate: string, type: string, language: string | null = null, pages: string | null = null, description: string | null = null) {
        this.id = id;
        this.title = title;
        this.stakeHolders = stakeHolders;
        this.scale = scale;
        this.issuanceDate = issuanceDate;
        this.type = type;
        this.language = language;
        this.pages = pages;
        this.description = description;
    }
}

export {Document}