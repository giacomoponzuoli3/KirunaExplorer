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
    const testCoordinate1 = new Coordinate(1, 5, 100, 200);
    const testCoordinate2 = new Coordinate(2, 10, 200, 100);
    const testCoordinate3 = new Coordinate(3, 1, 150, 150);
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1, testCoordinate2, testCoordinate3]);

    describe('getAllDocumentsCoordinates', () => {
        test('It should successfully retrieves all documents with their coordinates', async () => {

            jest.spyOn(dao, 'getAllDocumentsCoordinates').mockResolvedValue([testDocCoordinate]);

            await expect(controller.getAllDocumentsCoordinates()).resolves.toEqual([testDocCoordinate]);
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

        test('It should successfully set multiple coordinates for a document', async () => {
            const coordinates: LatLng[] = [
                { lat: 40.7128, lng: -74.0060 },
                { lat: 34.0522, lng: -118.2437 },
              ];

            jest.spyOn(dao, 'setDocumentCoordinates').mockResolvedValue(undefined);

            await expect(controller.setDocumentCoordinates(1,coordinates)).resolves.toEqual(undefined);
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,coordinates);
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

        test('It should reject if there is an database error error', async () => {
            const coordinate: LatLng = { lat: 40.7128, lng: -74.0060 };

            jest.spyOn(dao, 'setDocumentCoordinates').mockRejectedValue(new Error('Database error'));

            await expect(controller.setDocumentCoordinates(1,coordinate)).rejects.toThrow('Database error');
            expect(dao.setDocumentCoordinates).toHaveBeenCalledWith(1,coordinate);
        });


        test('It should reject if there is an unexpected error error', async () => {
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
          const updateSpy = jest.spyOn(dao, 'updateDocumentCoordinates').mockResolvedValueOnce(undefined);
      
          // Call the function and expect it to resolve without errors
          await expect(dao.updateDocumentCoordinates(documentId, coordinate)).resolves.toBeUndefined();
      
          // Ensure `dao.updateDocumentCoordinates` was called with the correct arguments
          expect(updateSpy).toHaveBeenCalledWith(documentId, coordinate);
        });
      
        test('It should successfully update document coordinates with multiple coordinates', async () => {
          const documentId = 2;
          const coordinates: LatLng[] = [
            { lat: 34.0522, lng: -118.2437 },
            { lat: 37.7749, lng: -122.4194 }
          ];
      
          // Mock `dao.updateDocumentCoordinates` to resolve successfully
          const updateSpy = jest.spyOn(dao, 'updateDocumentCoordinates').mockResolvedValueOnce(undefined);
      
          // Call the function and expect it to resolve without errors
          await expect(dao.updateDocumentCoordinates(documentId, coordinates)).resolves.toBeUndefined();
      
          // Ensure `dao.updateDocumentCoordinates` was called with the correct arguments
          expect(updateSpy).toHaveBeenCalledWith(documentId, coordinates);
        });
      
        test('It should reject if updating document coordinates fails', async () => {
          const documentId = 3;
          const coordinate: LatLng = { lat: 51.5074, lng: -0.1278 };
      
          // Mock `dao.updateDocumentCoordinates` to reject with an error
          jest.spyOn(dao, 'updateDocumentCoordinates').mockRejectedValueOnce(new Error('Update failed'));
      
          // Call the function and expect it to reject with the correct error message
          await expect(dao.updateDocumentCoordinates(documentId, coordinate)).rejects.toThrow('Update failed');
        });

        test('It should propagate unexpected errors', async () => {
            const documentId = 4;
            const coordinate: LatLng = { lat: 48.8566, lng: 2.3522 };
          
            // Mock `dao.updateDocumentCoordinates` to reject with an unexpected error
            jest.spyOn(dao, 'updateDocumentCoordinates').mockRejectedValueOnce(new Error('Unexpected error'));
          
            // Call the function and expect it to reject with the correct error message
            await expect(dao.updateDocumentCoordinates(documentId, coordinate)).rejects.toThrow('Unexpected error');
          });
    });

});
