class LinkNotFoundError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 404;
        this.customMessage = "Link(s) not found.";
    }
}

class LinkAlreadyExistsError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 409;
        this.customMessage = "Link already exists between these documents with the same name.";
    }
}

export {LinkNotFoundError, LinkAlreadyExistsError};