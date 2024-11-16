import Coordinate from '../models/coordinate';
import db from '../db/db'
import { DocCoordinates } from '../models/document_coordinate'
import { Stakeholder } from "../models/stakeholder"

interface LatLng {
    lat: number;
    lng: number;
}

class CoordinatesDAO {
     /**
     * Retrieves all documents with their coordinates 
     * @returns A Promise that resolves to the array of documents with their coordinates
     */
     getAllDocumentsCoordinates(): Promise<DocCoordinates[]> {
        return new Promise<DocCoordinates[]>((resolve, reject) => {
            try {
                const sql = `SELECT 
                            d.*, 
                            s.id AS stakeholder_id, 
                            s.name AS stakeholder_name, 
                            s.category AS stakeholder_category, 
                            dc.id AS coordinate_id, 
                            dc.latitude, 
                            dc.longitude, 
                            dc.point_order 
                            FROM documents d 
                            LEFT JOIN document_coordinates dc ON dc.document_id = d.id 
                            LEFT JOIN stakeholders_documents sd ON d.id = sd.id_document 
                            LEFT JOIN stakeholders s ON sd.id_stakeholder = s.id 
                            ORDER BY dc.point_order`;
    
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!rows || rows.length === 0) {
                        resolve([]);
                        return;
                    }
                    
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
                                []
                            ));
                        }
    
                        // Add stakeholder (always available) to the document's stakeholders array
                        //const stakeholder = new Stakeholder(row.stakeholder_id, row.stakeholder_name, row.stakeholder_category);

                        const doc = documentsMap.get(documentId);
                        if (doc) {
                            // Add stakeholder only if they are not already added
                            if (!doc.stakeHolders.some(stakeholder => stakeholder.id === row.stakeholder_id)) {
                                const stakeholder = new Stakeholder(row.stakeholder_id, row.stakeholder_name, row.stakeholder_category);
                                doc.stakeHolders.push(stakeholder);
                            }
                    
                            // Add coordinate only if it exists and is not already added
                            if (row.coordinate_id !== null && row.latitude !== null && row.longitude !== null) {
                                if (!doc.coordinates.some(coordinate => coordinate.id === row.coordinate_id)) {
                                    const coordinate = new Coordinate(row.coordinate_id, row.point_order, row.latitude, row.longitude);
                                    doc.coordinates.push(coordinate);
                                }
                            }
                        }

                    });
    
                    // Convert map values to array
                    const documents = Array.from(documentsMap.values());
                    resolve(documents);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Update the coordinates of a document
     * @param id is the id of document
     * @param coordinates is the vector of coordinate
     */
    
    setDocumentCoordinates(id: number, coord: LatLng|LatLng[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const coordinatesArray = Array.isArray(coord) ? coord : [coord];
                for (let i = 0; i < coordinatesArray.length; i++) {
                    const point = coordinatesArray[i];
                    const pointOrder = i + 1;
                    const sql = `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order) VALUES (?, ?, ?, ?)`;

                    db.run(sql, [id, point.lat, point.lng, pointOrder], (err: Error | null) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                    });
                    
                }
                
                return resolve();
            
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Delete the coordinates of a document by id
     * @param id the id of document
     * @return a void Promise
     */

    deleteDocumentCoordinatesById(id_document: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try{
                const sql = `DELETE FROM document_coordinates
                                WHERE document_id = ?`;
                db.run(sql, [id_document],  function (err: Error | null) { 
                    if(err){
                        //error in the db
                        return reject(err);
                    }
                    return resolve();

                });
            }catch(error){
                //general error during the operations
                return reject(error);
            }
        });
    }

    /**
     * The first step is delete the previous coordinates of a specific document (id) and after inserts the its new coordinates
     * @param id_document the id of the document
     * @param coord the array of coordinates (polygon or point)
     */
    async updateDocumentCoordinates(id_document: number, coord: LatLng | LatLng[]): Promise<void> {
        try {
            await this.deleteDocumentCoordinatesById(id_document);
            await this.setDocumentCoordinates(id_document, coord);
        } catch (error) {
            throw error; // Propagate error to caller
        }
    }

    /**
     * Get the coordinates of a specific document by id
     * @param id the id of a document
     * @return A Promise that returns an array of coords
     */


}

export {CoordinatesDAO};