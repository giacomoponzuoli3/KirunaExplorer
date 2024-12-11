class TypeNotFoundError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 404;
        this.customMessage = "Type(s) not found.";
    }
}

class TypeAlreadyExistsError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 409;
        this.customMessage = "Type already exists with the same name.";
    }
}

export {TypeNotFoundError, TypeAlreadyExistsError};