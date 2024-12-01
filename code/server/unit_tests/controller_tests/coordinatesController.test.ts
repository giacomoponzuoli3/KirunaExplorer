import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { CoordinatesDAO } from "../../src/dao/coordinatesDAO"
import { CoordinatesController } from "../../src/controllers/coordinatesController"
import Coordinate from '../../src/models/coordinate';
import { LatLng } from '../../src/interfaces';
import { DocCoordinates } from '../../src/models/document_coordinate'
import { Stakeholder } from "../../src/models/stakeholder"

jest.mock("../../src/dao/coordinatesDAO");

describe('coordinatesController', () => {
    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const dao = CoordinatesDAO.prototype;
    const controller = new CoordinatesController();
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testCoordinate1 = new Coordinate(1, 5, 100, 200,0);
    const testCoordinate2 = new Coordinate(2, 10, 200, 100,0);
    const testCoordinate3 = new Coordinate(3, 1, 150, 150,0);
    const testCoordinateMunicipalityArea = new Coordinate(4, null, null, null, 1);
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1, testCoordinate2, testCoordinate3]);
    const testDocCoordinateMunicipalityArea = new DocCoordinates(2, "title 2", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", [testCoordinateMunicipalityArea]);

    describe('getAllDocumentsCoordinates', () => {
        test('It should successfully retrieves all documents with their coordinates', async () => {

            jest.spyOn(dao, 'getAllDocumentsCoordinates').mockResolvedValue([testDocCoordinate,testDocCoordinateMunicipalityArea]);

            await expect(controller.getAllDocumentsCoordinates()).resolves.toEqual([testDocCoordinate,testDocCoordinateMunicipalityArea]);
            expect(dao.getAllDocumentsCoordinates).toHaveBeenCalledWith();

        });

        test('It should resolve an empty array if there is no documents', async () => {
            jest.spyOn(dao, 'getAllDocumentsCoordinates').mockResolvedValue([]);

            await expect(controller.getAllDocumentsCoordinates()).resolves.toEqual([]);
            expect(dao.getAllDocumentsCoordinates).toHaveBeenCalledWith();
        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(dao, 'getAllDocumentsCoordinates').mockRejectedValue(new Error('Database error'));

            await expect(controller.getAllDocumentsCoordinates()).rejects.toThrow('Database error');
            expect(dao.getAllDocumentsCoordinates).toHaveBeenCalledWith();
        });

        test("It should reject with error if an unexpected error occurs", async () => {
            jest.spyOn(dao, 'getAllDocumentsCoordinates').mockRejectedValue(new Error('Unexpected error'));

            await expect(controller.getAllDocumentsCoordinates()).rejects.toThrow('Unexpected error');
            expect(dao.getAllDocumentsCoordinates).toHaveBeenCalledWith();
        });
    });

    describe('setDocumentCoordinates', () => {

        test('It should successfully set a coordinate for a document', async () => {
            const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };

            jest.spyOn(dao, 'setDocumentCoordinates').mockResolvedValue(undefined);

            await expect(controller.setDocumentCoordinates(1,coordinate)).resolves.toEqual(undefined);
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,coordinate);
        });

        test('It should successfully set the municipality area for a document if no coordinates are provided', async () => {

            jest.spyOn(dao, 'setDocumentCoordinates').mockResolvedValue(undefined);

            await expect(controller.setDocumentCoordinates(1, [])).resolves.toBeUndefined();
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,[]);

        });

        test('It should successfully set multiple coordinates for a document', async () => {
            const coordinates: LatLng[] = [
                { lat: 40.7128, lng: -74.0060 },
                { lat: 34.0522, lng: -118.2437 },
              ];

            jest.spyOn(dao, 'setDocumentCoordinates').mockResolvedValue(undefined);

            await expect(controller.setDocumentCoordinates(1,coordinates)).resolves.toEqual(undefined);
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,coordinates);
        });

        test('It should reject if there is an error in set the municipality area', async () => {

            jest.spyOn(dao, 'setDocumentCoordinates').mockRejectedValue(new Error ('Set municipality area error'));

            await expect(controller.setDocumentCoordinates(1, [])).rejects.toThrow('Set municipality area error');
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,[]);

        });

        test('It should reject if there is an error in the first coordinate insertion', async () => {
            const coordinates: LatLng[] = [
                { lat: 40.7128, lng: -74.0060 },
                { lat: 34.0522, lng: -118.2437 },
              ];

            jest.spyOn(dao, 'setDocumentCoordinates').mockRejectedValue(new Error('First coordinate insertion error'));

            await expect(controller.setDocumentCoordinates(1,coordinates)).rejects.toThrow('First coordinate insertion error');
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,coordinates);
        });

        test('It should reject if there is an error in the second coordinate insertion', async () => {
            const coordinates: LatLng[] = [
                { lat: 40.7128, lng: -74.0060 },
                { lat: 34.0522, lng: -118.2437 },
              ];

            jest.spyOn(dao, 'setDocumentCoordinates').mockRejectedValue(new Error('Second coordinate insertion error'));

            await expect(controller.setDocumentCoordinates(1,coordinates)).rejects.toThrow('Second coordinate insertion error');
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,coordinates);
        });

        test('It should reject if there is an database error', async () => {
            const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };

            jest.spyOn(dao, 'setDocumentCoordinates').mockRejectedValue(new Error('Database error'));

            await expect(controller.setDocumentCoordinates(1,coordinate)).rejects.toThrow('Database error');
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,coordinate);
        });


        test('It should reject if there is an unexpected error', async () => {
            const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };

            jest.spyOn(dao, 'setDocumentCoordinates').mockRejectedValue(new Error('Unexpected error'));

            await expect(controller.setDocumentCoordinates(1,coordinate)).rejects.toThrow('Unexpected error');
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,coordinate);
        });

    });


    describe('updateDocumentCoordinates', () => {

        test('It should successfully update document coordinates with a single coordinate', async () => {
          const documentId = 1;
          const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };
      
          // Mock `dao.updateDocumentCoordinates` to resolve successfully
          jest.spyOn(dao, 'updateDocumentCoordinates').mockResolvedValueOnce(undefined);
      
          // Call the function and expect it to resolve without errors
          await expect(controller.updateDocumentCoordinates(documentId, coordinate,1)).resolves.toBeUndefined();
      
          // Ensure `dao.updateDocumentCoordinates` was called with the correct arguments
          expect(dao.updateDocumentCoordinates).toHaveBeenCalledWith(documentId, coordinate);
        });
      
        test('It should successfully update document coordinates with multiple coordinates', async () => {
          const documentId = 2;
          const coordinates: LatLng[] = [
            { lat: 34.0522, lng: -118.2437 },
            { lat: 37.7749, lng: -122.4194 }
          ];
      
          // Mock `dao.updateDocumentCoordinates` to resolve successfully
          jest.spyOn(dao, 'updateDocumentCoordinates').mockResolvedValueOnce(undefined);
      
          // Call the function and expect it to resolve without errors
          await expect(controller.updateDocumentCoordinates(documentId, coordinates,1)).resolves.toBeUndefined();
      
          // Ensure `dao.updateDocumentCoordinates` was called with the correct arguments
          expect(dao.updateDocumentCoordinates).toHaveBeenCalledWith(documentId, coordinates);
        });
      
        test('It should reject if updating document coordinates fails', async () => {
          const documentId = 3;
          const coordinate: LatLng = { lat: 51.5074, lng: -0.1278 };
      
          // Mock `dao.updateDocumentCoordinates` to reject with an error
          jest.spyOn(dao, 'updateDocumentCoordinates').mockRejectedValueOnce(new Error('Update failed'));
      
          // Call the function and expect it to reject with the correct error message
          await expect(controller.updateDocumentCoordinates(documentId, coordinate,1 )).rejects.toThrow('Update failed');

           // Ensure `dao.updateDocumentCoordinates` was called with the correct arguments
           expect(dao.updateDocumentCoordinates).toHaveBeenCalledWith(documentId, coordinate);
        });

        test('It should propagate unexpected errors', async () => {
            const documentId = 4;
            const coordinate: LatLng = { lat: 48.8566, lng: 2.3522 };
          
            // Mock `dao.updateDocumentCoordinates` to reject with an unexpected error
            jest.spyOn(dao, 'updateDocumentCoordinates').mockRejectedValueOnce(new Error('Unexpected error'));
          
            // Call the function and expect it to reject with the correct error message
            await expect(controller.updateDocumentCoordinates(documentId, coordinate, 1)).rejects.toThrow('Unexpected error');

            // Ensure `dao.updateDocumentCoordinates` was called with the correct arguments
            expect(dao.updateDocumentCoordinates).toHaveBeenCalledWith(documentId, coordinate);
          });
    });

    describe('deleteDocumentCoordinates', () => {
        test('It should successfully delete document coordinates by ID', async () => {
            const documentId = 1;

            jest.spyOn(dao,'deleteDocumentCoordinatesById').mockResolvedValue(undefined);

            await expect(controller.deleteDocumentCoordinates(documentId)).resolves.toBeUndefined();

            expect(dao.deleteDocumentCoordinatesById).toHaveBeenCalledWith(documentId);
        });

        test('It should reject if there is an error in deleting document coordinates', async () => {
            const documentId = 1;

            jest.spyOn(dao,'deleteDocumentCoordinatesById').mockRejectedValue(new Error('Failed to delete'));

            await expect(controller.deleteDocumentCoordinates(documentId)).rejects.toThrow('Failed to delete');

            expect(dao.deleteDocumentCoordinatesById).toHaveBeenCalledWith(documentId);
        });

        test('It should reject if there is an unexpected error', async () => {
            const documentId = 1;

            jest.spyOn(dao,'deleteDocumentCoordinatesById').mockRejectedValue(new Error('Unexpected error'));

            await expect(controller.deleteDocumentCoordinates(documentId)).rejects.toThrow('Unexpected error');

            expect(dao.deleteDocumentCoordinatesById).toHaveBeenCalledWith(documentId);
        });
    });

});
