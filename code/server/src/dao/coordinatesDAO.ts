import Coordinate from '../models/coordinate';
import db from '../db/db'
import { DocCoordinates } from '../models/document_coordinate'
import { Stakeholder } from "../models/stakeholder"
import { LatLng } from '../interfaces';

class CoordinatesDAO {
     /**
     * Retrieves all documents with their coordinates 
     * @returns A Promise that resolves to the array of documents with their coordinates
     */
    getAllDocumentsCoordinates(): Promise<DocCoordinates[]> {
        return new Promise<DocCoordinates[]>(async (resolve, reject) => {
            try {
                let rows: any[] = await new Promise<any[]>((resolve, reject) => {
                    const sql = `SELECT d.*, 
                            s.id AS stakeholder_id, 
                            s.name AS stakeholder_name, 
                            s.category AS stakeholder_category, 
                            dc.id AS coordinate_id, 
                            dc.latitude, 
                            dc.longitude, 
                            dc.point_order
                                FROM documents d 
                                JOIN document_coordinates dc ON dc.document_id = d.id
                                JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id
                                ORDER BY dc.point_order`;

                    db.all(sql, [], (err: Error | null, rows: any[]) => {
                        if (err) return reject(err);
                        if (!rows || rows.length == 0) return resolve([]);

                        resolve(rows);
                    });
                })

                const documentsMap = new Map<number, DocCoordinates>();
                rows.forEach((row: any) => {
                    const documentId = row.id;
                    if (!documentsMap.has(documentId)) {
                        documentsMap.set(documentId, new DocCoordinates(
                            row.id,
                            row.title,
                            [],  // Placeholder for stakeholders, populated below
                            row.scale,
                            row.issuance_date,
                            row.type,
                            row.language,
                            row.pages,
                            row.description,
                            []   // Placeholder for coordinates, populated below
                        ));
                    }

                    const doc = documentsMap.get(documentId);
                    if (doc) {
                        // Add stakeholder (always available) to the document's stakeholders array
                        const stakeholder = new Stakeholder(row.stakeholder_id, row.stakeholder_name, row.stakeholder_category);
                        doc.stakeHolders.push(stakeholder);

                        // Add coordinate to the document's coordinates array
                        const coordinate = new Coordinate(row.coordinate_id, row.point_order, row.latitude, row.longitude);
                        doc.coordinates.push(coordinate);
                    }
                });

                // Convert map values to array
                const documents = Array.from(documentsMap.values());
                resolve(documents);
            } catch (error) {
                reject(error);
            }
        });
    }
    

    /**
     * Update the coordinates of a document
     * @param id is the id of document
     * @param coordinates is the vector of coordinate
     * @returns a Promise that resolves when the coordinates have been updated
     */
    setDocumentCoordinates(id: number, coords: LatLng|LatLng[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const coordinatesArray = Array.isArray(coords) ? coords : [coords];

                const sql = `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order) VALUES (?, ?, ?, ?)`;
                const coordinatesInserts = coordinatesArray.map((point, index) => new Promise<void>(
                    (resolveInsert, rejectInsert) => {
                        const pointOrder = index + 1;

                        db.run(sql, [id, point.lat, point.lng, pointOrder], (err: Error | null) => {
                            if (err) rejectInsert(err);
                            else resolveInsert();
                        })
                    })
                )

                Promise.all(coordinatesInserts)
                    .then(() => resolve())
                    .catch(error => reject(error));
            } catch (error) {
                reject(error);
            }
        });
    }
}

export {CoordinatesDAO};