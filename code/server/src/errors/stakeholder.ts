class StakeholderNotFoundError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 404;
        this.customMessage = "Stakeholders not found.";
    }

}

export { StakeholderNotFoundError }