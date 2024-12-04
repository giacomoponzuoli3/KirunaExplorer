class ScaleNotFoundError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 404;
        this.customMessage = "Scale(s) not found.";
    }
}

class ScaleAlreadyExistsError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 409;
        this.customMessage = "Scale already exists with the same name.";
    }
}

export {ScaleNotFoundError, ScaleAlreadyExistsError};