import Coordinate from '../models/coordinate';
import db from '../db/db'
import { DocCoordinates } from '../models/document_coordinate'
import { Stakeholder } from "../models/stakeholder"
import { LatLng } from "../interfaces"

class CoordinatesDAO {
     /**
     * Retrieves all documents with their coordinates 
     * @returns A Promise that resolves to the array of documents with their coordinates
     */
     getAllDocumentsCoordinates(): Promise<DocCoordinates[]> {
        return new Promise<DocCoordinates[]>((resolve, reject) => {
            try {
                const sql = `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category, dc.id AS coordinate_id, dc.latitude,dc.longitude, dc.point_order, dc.municipality_area FROM documents d LEFT JOIN document_coordinates dc ON dc.document_id = d.id LEFT JOIN stakeholders_documents sd ON d.id = sd.id_document LEFT JOIN stakeholders s ON sd.id_stakeholder = s.id ORDER BY dc.point_order`;
    
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);
                    if (!rows || rows.length === 0) return resolve([]);
                    
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
                            if ((row.coordinate_id !== null && row.latitude !== null && row.longitude !== null) || (row.municipality_area == 1)) {
                                if (!doc.coordinates.some(coordinate => coordinate.id === row.coordinate_id)) {
                                    const coordinate = new Coordinate(row.coordinate_id, row.point_order, row.latitude, row.longitude, row.municipality_area);
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
     * Sets the coordinates of a document with the given id.
     * @param id The id of the document to set the coordinates of.
     * @param coords The coordinates to set, either a single LatLng object or an array of LatLng objects.
     * @returns A Promise that resolves when the coordinates have been set.
     */
    setDocumentCoordinates(id: number, coords: LatLng | LatLng[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const coordinatesArray = Array.isArray(coords) ? coords : [coords];
                
                if(coordinatesArray.length > 0){
                    const coordinatesInserts = coordinatesArray.map((point, index) => {
                        return new Promise<void>((innerResolve, innerReject) => {
                            const sql = `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order, municipality_area) VALUES (?, ?, ?, ?, ?)`;
                            const pointOrder = index + 1;
        
                            db.run(sql, [id, point.lat, point.lng, pointOrder, 0], (err: Error | null) => {
                                if (err) {
                                    innerReject(err);
                                } else {
                                    innerResolve();
                                }
                            });
                        });
                    });
        
                    Promise.all(coordinatesInserts)
                        .then(() => resolve())
                        .catch((error) => reject(error));
                }else{
                    const sql = `INSERT INTO document_coordinates (document_id, municipality_area) VALUES (?, ?)`;
                
                    db.run(sql, [id, 1], (err: Error | null) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve();
                        }
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    

    /**
     * Delete the coordinates of a document by id
     * @param id_document the id of document
     * @return a void Promise
     */

    deleteDocumentCoordinatesById(id_document: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try{
                const sql = `DELETE FROM document_coordinates WHERE document_id = ?`;
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
     * @param coords the array of coordinates (polygon or point)
     */
    async updateDocumentCoordinates(id_document: number, coords: LatLng | LatLng[]): Promise<void> {
        try {
            await this.deleteDocumentCoordinatesById(id_document);
            await this.setDocumentCoordinates(id_document, coords);
        } catch (error) {
            throw error; // Propagate error to caller
        }
    }

    /**
     * Get all the existing georeferences (points and polygons)
     * @returns A Promise that returns the array of Coordinate[][] where each object is an array of coordinates that represent points or polygons 
     */
    getExistingGeoreferences(): Promise<Coordinate[][]> {
        return new Promise<Coordinate[][]>((resolve, reject) => {
            try{
                const sql = `SELECT * FROM document_coordinates WHERE municipality_area = 0 ORDER BY document_id, point_order;`;
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if(err){
                        return reject(err);
                    }

                    const coordinatesByDocument: Record<number, Coordinate[]> = {};

                    // Raggruppa le coordinate per document_id
                    rows.forEach(row => {
                        const documentId = row.document_id;
                        
                        // Se non esiste un array per questo document_id, crealo
                        if (!coordinatesByDocument[documentId]) {
                            coordinatesByDocument[documentId] = [];
                        }

                        // Aggiungi la coordinata al gruppo di questo document_id
                        coordinatesByDocument[documentId].push(
                            new Coordinate(row.id, row.point_order, row.latitude, row.longitude, 0)
                        );
                    });

                    // Converte l'oggetto in un array di array di coordinate
                    const result = Object.values(coordinatesByDocument);
                    resolve(result);
                });    
            
            }catch(error){
                //general error during the operations
                return reject(error);
            }
        })
    }


}

export {CoordinatesDAO};
