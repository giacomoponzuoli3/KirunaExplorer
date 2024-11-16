class UserAlreadyExistsError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 409;
        this.customMessage = 'User already exists.';
    }
}

class UserNotFoundError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 404;
        this.customMessage = 'User not found.';
    }
}

export { UserAlreadyExistsError, UserNotFoundError };