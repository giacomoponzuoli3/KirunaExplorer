import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { CoordinatesDAO } from "../../src/dao/coordinatesDAO"
import db from "../../src/db/db"
import Coordinate from '../../src/models/coordinate';
import { LatLng } from '../../src/interfaces';
import { DocCoordinates } from '../../src/models/document_coordinate'
import { Stakeholder } from "../../src/models/stakeholder"
import { Database } from "sqlite3";

jest.mock("../../src/db/db.ts");

describe('coordinatesDAO', () => {

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const dao = new CoordinatesDAO();
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testCoordinate1 = new Coordinate(1, 5, 100, 200, 0);
    const testCoordinate2 = new Coordinate(2, 10, 200, 100, 0);
    const testCoordinate3 = new Coordinate(3, 1, 150, 150, 0);
    const testCoordinateMunicipalityArea = new Coordinate(4, null, null, null, 1);
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1, testCoordinate2, testCoordinate3]);
    const testDocCoordinateMunicipalityArea = new DocCoordinates(2, "title 2", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", [testCoordinateMunicipalityArea]);

    describe('getAllDocumentsCoordinates', () => {
        test('It should successfully retrieves all documents with their coordinates', async () => {

            const testRows = [
                // First stakeholder with the first coordinate
                {
                    id: 1,
                    title: 'title',
                    scale: '1:1',
                    issuance_date: '2020-10-10',
                    type: 'Informative document',
                    language: 'English',
                    pages: '300',
                    description: 'description',
                    stakeholder_id: 1,
                    stakeholder_name: 'John',
                    stakeholder_category: 'urban developer',
                    coordinate_id: 1,
                    point_order: 5,
                    latitude: 100,
                    longitude: 200,
                    municipality_area: 0
                },
                // First stakeholder with the second coordinate
                {
                    id: 1,
                    title: 'title',
                    scale: '1:1',
                    issuance_date: '2020-10-10',
                    type: 'Informative document',
                    language: 'English',
                    pages: '300',
                    description: 'description',
                    stakeholder_id: 1,
                    stakeholder_name: 'John',
                    stakeholder_category: 'urban developer',
                    coordinate_id: 2,
                    point_order: 10,
                    latitude: 200,
                    longitude: 100,
                    municipality_area: 0
                },
                // First stakeholder with the third coordinate
                {
                    id: 1,
                    title: 'title',
                    scale: '1:1',
                    issuance_date: '2020-10-10',
                    type: 'Informative document',
                    language: 'English',
                    pages: '300',
                    description: 'description',
                    stakeholder_id: 1,
                    stakeholder_name: 'John',
                    stakeholder_category: 'urban developer',
                    coordinate_id: 3,
                    point_order: 1,
                    latitude: 150,
                    longitude: 150,
                    municipality_area: 0
                },
                // Second stakeholder with the first coordinate
                {
                    id: 1,
                    title: 'title',
                    scale: '1:1',
                    issuance_date: '2020-10-10',
                    type: 'Informative document',
                    language: 'English',
                    pages: '300',
                    description: 'description',
                    stakeholder_id: 2,
                    stakeholder_name: 'Bob',
                    stakeholder_category: 'urban developer',
                    coordinate_id: 1,
                    point_order: 5,
                    latitude: 100,
                    longitude: 200,
                    municipality_area: 0
                },
                // Second stakeholder with the second coordinate
                {
                    id: 1,
                    title: 'title',
                    scale: '1:1',
                    issuance_date: '2020-10-10',
                    type: 'Informative document',
                    language: 'English',
                    pages: '300',
                    description: 'description',
                    stakeholder_id: 2,
                    stakeholder_name: 'Bob',
                    stakeholder_category: 'urban developer',
                    coordinate_id: 2,
                    point_order: 10,
                    latitude: 200,
                    longitude: 100,
                    municipality_area: 0
                },
                // Second stakeholder with the third coordinate
                {
                    id: 1,
                    title: 'title',
                    scale: '1:1',
                    issuance_date: '2020-10-10',
                    type: 'Informative document',
                    language: 'English',
                    pages: '300',
                    description: 'description',
                    stakeholder_id: 2,
                    stakeholder_name: 'Bob',
                    stakeholder_category: 'urban developer',
                    coordinate_id: 3,
                    point_order: 1,
                    latitude: 150,
                    longitude: 150,
                    municipality_area: 0
                },
                // First stakeholder with the municipality area
                {
                    id: 2,
                    title: 'title 2',
                    scale: '1:1',
                    issuance_date: '2020-10-10',
                    type: 'Informative document',
                    language: 'English',
                    pages: '300',
                    description: 'description 2',
                    stakeholder_id: 1,
                    stakeholder_name: 'John',
                    stakeholder_category: 'urban developer',
                    coordinate_id: 4,
                    latitude: null,
                    longitude: null,
                    municipality_area: 1,
                    point_order: null
                },

                // Second stakeholder with the municipality area
                {
                    id: 2,
                    title: 'title 2',
                    scale: '1:1',
                    issuance_date: '2020-10-10',
                    type: 'Informative document',
                    language: 'English',
                    pages: '300',
                    description: 'description 2',
                    stakeholder_id: 2,
                    stakeholder_name: 'Bob',
                    stakeholder_category: 'urban developer',
                    coordinate_id: 4,
                    latitude: null,
                    longitude: null,
                    municipality_area: 1,
                    point_order: null
                }
            ];

            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, testRows);
                    return {} as Database;
                })

            await expect(dao.getAllDocumentsCoordinates()).resolves.toEqual([testDocCoordinate, testDocCoordinateMunicipalityArea]);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category, dc.id AS coordinate_id, dc.latitude,dc.longitude, dc.point_order, dc.municipality_area FROM documents d LEFT JOIN document_coordinates dc ON dc.document_id = d.id LEFT JOIN stakeholders_documents sd ON d.id = sd.id_document LEFT JOIN stakeholders s ON sd.id_stakeholder = s.id ORDER BY dc.point_order`,
                [], expect.any(Function)
            );
        });

        test('It should resolve an empty array if there is no documents', async () => {
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, null);
                    return {} as Database;
                })

            await expect(dao.getAllDocumentsCoordinates()).resolves.toEqual([]);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category, dc.id AS coordinate_id, dc.latitude,dc.longitude, dc.point_order, dc.municipality_area FROM documents d LEFT JOIN document_coordinates dc ON dc.document_id = d.id LEFT JOIN stakeholders_documents sd ON d.id = sd.id_document LEFT JOIN stakeholders s ON sd.id_stakeholder = s.id ORDER BY dc.point_order`,
                [], expect.any(Function)
            );
        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Database error'));
                    return {} as Database;
                })

            await expect(dao.getAllDocumentsCoordinates()).rejects.toThrow(`Database error`);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category, dc.id AS coordinate_id, dc.latitude,dc.longitude, dc.point_order, dc.municipality_area FROM documents d LEFT JOIN document_coordinates dc ON dc.document_id = d.id LEFT JOIN stakeholders_documents sd ON d.id = sd.id_document LEFT JOIN stakeholders s ON sd.id_stakeholder = s.id ORDER BY dc.point_order`,
                [], expect.any(Function)
            );

        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.all as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.getAllDocumentsCoordinates()).rejects.toThrow("Unexpected error");
        });

    });


    describe('setDocumentCoordinates', () => {

        test('It should successfully set a coordinate for a document', async () => {
            const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.setDocumentCoordinates(1, coordinate)).resolves.toBeUndefined();

            expect(db.run).toHaveBeenCalledWith(
                `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order, municipality_area) VALUES (?, ?, ?, ?, ?)`,
                [1, coordinate.lat, coordinate.lng, 1, 0],
                expect.any(Function)
            );
        });

        test('It should successfully set the municipality area for a document if no coordinates are provided', async () => {

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.setDocumentCoordinates(1, [])).resolves.toBeUndefined();

            expect(db.run).toHaveBeenCalledWith(
                `INSERT INTO document_coordinates (document_id, municipality_area) VALUES (?, ?)`,
                [1, 1],
                expect.any(Function)
            );
        });

        test('It should successfully set multiple coordinates for a document', async () => {
            const coordinates: LatLng[] = [
                { lat: 40.7128, lng: -74.0060 },
                { lat: 34.0522, lng: -118.2437 },
            ];

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.setDocumentCoordinates(1, coordinates)).resolves.toBeUndefined();

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order, municipality_area) VALUES (?, ?, ?, ?, ?)`,
                [1, coordinates[0].lat, coordinates[0].lng, 1, 0],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order, municipality_area) VALUES (?, ?, ?, ?, ?)`,
                [1, coordinates[1].lat, coordinates[1].lng, 2, 0],
                expect.any(Function)
            );

        });

        test('It should reject if there is an error in set the municipality area', async () => {

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Set municipality area error'));
                    return {} as Database;
                });

            await expect(dao.setDocumentCoordinates(1, [])).rejects.toThrow('Set municipality area error');

        });

        test('It should reject if there is an error in the first coordinate insertion', async () => {
            const coordinates: LatLng[] = [
                { lat: 40.7128, lng: -74.0060 },
                { lat: 34.0522, lng: -118.2437 },
            ];

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('First coordinate insertion error'));
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.setDocumentCoordinates(1, coordinates)).rejects.toThrow('First coordinate insertion error');

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order, municipality_area) VALUES (?, ?, ?, ?, ?)`,
                [1, coordinates[0].lat, coordinates[0].lng, 1, 0],
                expect.any(Function)
            );

        });

        test('It should reject if there is an error in the second coordinate insertion', async () => {
            const coordinates: LatLng[] = [
                { lat: 40.7128, lng: -74.0060 },
                { lat: 34.0522, lng: -118.2437 },
            ];

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Second coordinate insertion error'));
                    return {} as Database;
                });

            await expect(dao.setDocumentCoordinates(1, coordinates)).rejects.toThrow('Second coordinate insertion error');

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order, municipality_area) VALUES (?, ?, ?, ?, ?)`,
                [1, coordinates[0].lat, coordinates[0].lng, 1, 0],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order, municipality_area) VALUES (?, ?, ?, ?, ?)`,
                [1, coordinates[1].lat, coordinates[1].lng, 2, 0],
                expect.any(Function)
            );

        });

        test('It should reject if there is a database error', async () => {
            const coordinate: LatLng = { lat: 45.0, lng: -93.0 };

            jest.spyOn(db, 'run').mockImplementation(() => {
                throw new Error("Database error");
            });

            await expect(dao.setDocumentCoordinates(1, coordinate)).rejects.toThrow("Database error");
        });


        test('It should reject if there is an unexpected error', async () => {
            const coordinate: LatLng = { lat: 45.0, lng: -93.0 };

            (db.run as jest.Mock).mockImplementation(() => {
                throw new Error("Unexpected error");
            });

            await expect(dao.setDocumentCoordinates(1, coordinate)).rejects.toThrow("Unexpected error");
        });

    });

    describe('deleteDocumentCoordinatesById', () => {

        test('It should successfully delete document coordinates by ID', async () => {
            const documentId = 1;

            // Mock `db.run` to simulate a successful delete
            jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });

            // Test that the promise resolves without error
            await expect(dao.deleteDocumentCoordinatesById(documentId)).resolves.toBeUndefined();

            // Check that `db.run` was called with the correct SQL and parameters
            expect(db.run).toHaveBeenCalledWith(
                `DELETE FROM document_coordinates WHERE document_id = ?`,
                [documentId],
                expect.any(Function)
            );
        });

        test('It should reject if there is an error in deleting document coordinates', async () => {
            const documentId = 1;

            // Mock `db.run` to simulate an error during delete
            jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Failed to delete'));
                return {} as Database;
            });

            // Test that the promise rejects with the correct error message
            await expect(dao.deleteDocumentCoordinatesById(documentId)).rejects.toThrow('Failed to delete');

            // Ensure `db.run` was called as expected
            expect(db.run).toHaveBeenCalledWith(
                `DELETE FROM document_coordinates WHERE document_id = ?`,
                [documentId],
                expect.any(Function)
            );
        });

        test('It should reject if there is an unexpected error', async () => {
            const documentId = 1;

            // Mock `db.run` to throw an unexpected error
            jest.spyOn(db, 'run').mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            // Test that the promise rejects with the correct error message
            await expect(dao.deleteDocumentCoordinatesById(documentId)).rejects.toThrow('Unexpected error');
        });
    });


    describe('updateDocumentCoordinates', () => {

        test('It should successfully update document coordinates with a single coordinate', async () => {
            const documentId = 1;
            const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };

            // Mock `deleteDocumentCoordinatesById` and `setDocumentCoordinates`
            const deleteSpy = jest.spyOn(dao, 'deleteDocumentCoordinatesById').mockResolvedValueOnce(undefined);
            const setSpy = jest.spyOn(dao, 'setDocumentCoordinates').mockResolvedValueOnce(undefined);

            // Call the function
            await expect(dao.updateDocumentCoordinates(documentId, coordinate)).resolves.toBeUndefined();

            // Verify that both methods were called with the correct arguments
            expect(deleteSpy).toHaveBeenCalledWith(documentId);
            expect(setSpy).toHaveBeenCalledWith(documentId, coordinate);
        });

        test('It should successfully update document coordinates with multiple coordinates', async () => {
            const documentId = 2;
            const coordinates: LatLng[] = [
                { lat: 40.7128, lng: -74.0060 },
                { lat: 34.0522, lng: -118.2437 }
            ];

            // Mock `deleteDocumentCoordinatesById` and `setDocumentCoordinates`
            const deleteSpy = jest.spyOn(dao, 'deleteDocumentCoordinatesById').mockResolvedValueOnce(undefined);
            const setSpy = jest.spyOn(dao, 'setDocumentCoordinates').mockResolvedValueOnce(undefined);

            // Call the function
            await expect(dao.updateDocumentCoordinates(documentId, coordinates)).resolves.toBeUndefined();

            // Verify that both methods were called with the correct arguments
            expect(deleteSpy).toHaveBeenCalledWith(documentId);
            expect(setSpy).toHaveBeenCalledWith(documentId, coordinates);
        });

        test('It should reject if deleting document coordinates fails', async () => {
            const documentId = 3;
            const coordinate: LatLng = { lat: 51.5074, lng: -0.1278 };

            // Mock `deleteDocumentCoordinatesById` to simulate an error
            jest.spyOn(dao, 'deleteDocumentCoordinatesById').mockRejectedValueOnce(new Error('Delete failed'));

            // Mock `setDocumentCoordinates` to ensure it is not called
            const setSpy = jest.spyOn(dao, 'setDocumentCoordinates');

            // Call the function and expect it to reject
            await expect(dao.updateDocumentCoordinates(documentId, coordinate)).rejects.toThrow('Delete failed');

            // Ensure `setDocumentCoordinates` was never called
            expect(setSpy).not.toHaveBeenCalled();
        });

        test('It should reject if setting new coordinates fails', async () => {
            const documentId = 4;
            const coordinate: LatLng = { lat: 48.8566, lng: 2.3522 };

            // Mock `deleteDocumentCoordinatesById` to succeed
            jest.spyOn(dao, 'deleteDocumentCoordinatesById').mockResolvedValueOnce(undefined);

            // Mock `setDocumentCoordinates` to simulate an error
            jest.spyOn(dao, 'setDocumentCoordinates').mockRejectedValueOnce(new Error('Insert failed'));

            // Call the function and expect it to reject
            await expect(dao.updateDocumentCoordinates(documentId, coordinate)).rejects.toThrow('Insert failed');
        });

        test('It should propagate unexpected errors', async () => {
            const documentId = 5;
            const coordinate: LatLng = { lat: 37.7749, lng: -122.4194 };

            // Mock `deleteDocumentCoordinatesById` to throw an unexpected error
            jest.spyOn(dao, 'deleteDocumentCoordinatesById').mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            // Call the function and expect it to reject
            await expect(dao.updateDocumentCoordinates(documentId, coordinate)).rejects.toThrow('Unexpected error');
        });
    });

    describe('getExistingGeoreferences', () => {
        test('it should successfully get all the existing georeferences (points and polygons)', async () => {
            const mockRows = [
                { document_id: 1, id: 1, point_order: 1, latitude: 10, longitude: 20 },
                { document_id: 1, id: 2, point_order: 2, latitude: 15, longitude: 25 }
            ];

            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, mockRows);
                return {} as Database;
            });

            await expect(dao.getExistingGeoreferences()).resolves.toEqual([[new Coordinate(1, 1, 10, 20, 0), new Coordinate(2, 2, 15, 25, 0)]]);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT * FROM document_coordinates WHERE municipality_area = 0 ORDER BY document_id, point_order;`,
                [],
                expect.any(Function)
            );
        });

        test('it should reject if there is a database error', async () => {
            
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Database error'));
                return {} as Database;
            });
            
            await expect(dao.getExistingGeoreferences()).rejects.toThrow('Database error');
            
        });

        test('it should reject if an unexpected error occurs', async () => {

            (db.all as jest.Mock).mockImplementation(() => {
                throw new Error("Unexpected error");
            });

            await expect(dao.getExistingGeoreferences()).rejects.toThrow("Unexpected error");
        });
    });

});
