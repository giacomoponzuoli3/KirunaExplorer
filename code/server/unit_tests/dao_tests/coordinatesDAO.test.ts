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
    const testCoordinate1 = new Coordinate(1, 5, 100, 200);
    const testCoordinate2 = new Coordinate(2, 10, 200, 100);
    const testCoordinate3 = new Coordinate(3, 1, 150, 150);
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1, testCoordinate2, testCoordinate3]);

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
                    longitude: 200
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
                    longitude: 100
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
                    longitude: 150
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
                    longitude: 200
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
                    longitude: 100
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
                    longitude: 150
                }
            ];

            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, testRows);
                    return {} as Database;
                })

            await expect(dao.getAllDocumentsCoordinates()).resolves.toEqual([testDocCoordinate]);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category, dc.id AS coordinate_id, dc.latitude,dc.longitude, dc.point_order FROM documents d LEFT JOIN document_coordinates dc ON dc.document_id = d.id LEFT JOIN stakeholders_documents sd ON d.id = sd.id_document LEFT JOIN stakeholders s ON sd.id_stakeholder = s.id ORDER BY dc.point_order`,
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
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category, dc.id AS coordinate_id, dc.latitude,dc.longitude, dc.point_order FROM documents d LEFT JOIN document_coordinates dc ON dc.document_id = d.id LEFT JOIN stakeholders_documents sd ON d.id = sd.id_document LEFT JOIN stakeholders s ON sd.id_stakeholder = s.id ORDER BY dc.point_order`,
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
              `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category, dc.id AS coordinate_id, dc.latitude,dc.longitude, dc.point_order FROM documents d LEFT JOIN document_coordinates dc ON dc.document_id = d.id LEFT JOIN stakeholders_documents sd ON d.id = sd.id_document LEFT JOIN stakeholders s ON sd.id_stakeholder = s.id ORDER BY dc.point_order`,
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
              `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order) VALUES (?, ?, ?, ?)`,
              [1, coordinate.lat, coordinate.lng, 1],
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
              `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order) VALUES (?, ?, ?, ?)`,
              [1, coordinates[0].lat, coordinates[0].lng, 1],
              expect.any(Function)
            );
            
            expect(db.run).toHaveBeenNthCalledWith(
                2,
                `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order) VALUES (?, ?, ?, ?)`,
                [1, coordinates[1].lat, coordinates[1].lng, 2],
                expect.any(Function)
            );

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
              `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order) VALUES (?, ?, ?, ?)`,
              [1, coordinates[0].lat, coordinates[0].lng, 1],
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
              `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order) VALUES (?, ?, ?, ?)`,
              [1, coordinates[0].lat, coordinates[0].lng, 1],
              expect.any(Function)
            );
            
            expect(db.run).toHaveBeenNthCalledWith(
                2,
                `INSERT INTO document_coordinates (document_id, latitude, longitude, point_order) VALUES (?, ?, ?, ?)`,
                [1, coordinates[1].lat, coordinates[1].lng, 2],
                expect.any(Function)
            );

        });

        test('It should reject if there is a database error', async () => {
            const coordinate: LatLng = { lat: 45.0, lng: -93.0 };
    
            (db.run as jest.Mock).mockImplementation(() => {
                throw new Error("Database error");
            });

            await expect(dao.setDocumentCoordinates(1,coordinate)).rejects.toThrow("Database error");
        });


        test('It should reject if there is an unexpected error', async () => {
            const coordinate: LatLng = { lat: 45.0, lng: -93.0 };
    
            (db.run as jest.Mock).mockImplementation(() => {
                throw new Error("Unexpected error");
            });

            await expect(dao.setDocumentCoordinates(1,coordinate)).rejects.toThrow("Unexpected error");
        });

    });

});