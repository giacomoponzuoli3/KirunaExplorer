import { DocCoordinates } from "../models/document_coordinate";
import { CoordinatesDAO } from "../dao/coordinatesDAO";
import { LatLng } from "../interfaces";
import Coordinate from "../models/coordinate"; 

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
     * Delete the coordinates of a document
     * @param id_document the id of the document to delete the coordinates
     * @return A Promise that resolves when the coordinates have been deleted
     */
    deleteDocumentCoordinates(id_document: number): Promise<void> {
        return this.dao.deleteDocumentCoordinatesById(id_document);
    }

    /**
     * Get all the existing georeferences (point and polygons), except the municipality_area
     * @return A Promise that returns a Coordinate[][]
     */
    getExistingGeoreferences(): Promise<Coordinate[][]> {
        return this.dao.getExistingGeoreferences();
    }

}

export { CoordinatesController };