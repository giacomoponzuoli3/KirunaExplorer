class DocumentNotFoundError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 404;
        this.customMessage = "Document(s) not found.";
    }
}

export {DocumentNotFoundError}