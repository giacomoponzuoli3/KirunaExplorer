import { DocCoordinates } from "../models/document_coordinate";
import { CoordinatesDAO } from "../dao/coordinatesDAO";

class CoordinatesController {
    private dao: CoordinatesDAO;

    constructor() {
        this.dao = new CoordinatesDAO();
    }

    /**
     * Retrieves all documents with their coordinates.
     * @returns A Promise that resolves to an array of DocCoordinates objects.
     */
    getAllDocumentsCoordinates(): Promise<DocCoordinates[]> {
        return this.dao.getAllDocumentsCoordinates();
    }
}

export { CoordinatesController };