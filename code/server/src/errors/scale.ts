class ScaleNotFoundError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 404;
        this.customMessage = "Scale(s) not found.";
    }
}

export {ScaleNotFoundError};