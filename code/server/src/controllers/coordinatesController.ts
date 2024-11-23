import { DocCoordinates } from "../models/document_coordinate";
import { CoordinatesDAO } from "../dao/coordinatesDAO";
import { LatLng } from "../interfaces";

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

    /**
     * Sets the coordinates of a document with the given id.
     * @param id The id of the document to set the coordinates of.
     * @param coords The coordinates to set, either a single LatLng object or an array of LatLng objects.
     * @returns A Promise that resolves when the coordinates have been set.
     */
    setDocumentCoordinates(id: number, coords: LatLng|LatLng[]): Promise<void> {
        return this.dao.setDocumentCoordinates(id, coords);
    }

    /**
     * Modify the coordinates of a document
     * @param id_document the id of the document to update the coordinates
     * @param coords the array of the new coordinates
     * @return A Promise that resolves when the coordinates have been updated
     */
    updateDocumentCoordinates(id_document: number, coords: LatLng|LatLng[]): Promise<void> {
        return this.dao.updateDocumentCoordinates(id_document, coords);
    }

    /**
     * Retrieves the municipality area.
     * @returns A Promise that resolves to an array of LatLng objects representing the municipality area.
     */
    getMunicipalityArea(): Promise<LatLng[]> {
        return this.dao.getMunicipalityArea();
    }
}

export { CoordinatesController };