class TypeNotFoundError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 404;
        this.customMessage = "Type(s) not found.";
    }
}

export {TypeNotFoundError};