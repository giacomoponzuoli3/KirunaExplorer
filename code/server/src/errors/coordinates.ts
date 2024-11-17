class CoordinatesTypeError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 422;
        this.customMessage = "Coordinates must be a LatLng object or an array of LatLng";
    }
}

class CoordinatesArrayError extends Error {
    customCode: number;
    customMessage: string;

    constructor() {
        super();

        this.customCode = 422;
        this.customMessage = "Each elements of coordinates must be an LatLng object";
    }
}

export { CoordinatesTypeError, CoordinatesArrayError}