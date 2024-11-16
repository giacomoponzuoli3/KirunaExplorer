import { describe, afterAll, beforeAll, beforeEach, test, expect, jest } from "@jest/globals"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { CoordinatesDAO } from "../../src/dao/coordinatesDAO"
import { CoordinatesController } from "../../src/controllers/coordinatesController"
import Coordinate from '../../src/models/coordinate';
import { LatLng } from '../../src/interfaces';
import { DocCoordinates } from '../../src/models/document_coordinate'
import { Stakeholder } from "../../src/models/stakeholder"
import { cleanup } from "../../src/db/cleanup";
import { setup} from "../../src/db/setup";


describe('coordinatesController/coordinatesDAO Integration tests', () => {

    beforeAll(async () => {
        await setup();
     });
    
     afterAll(async () => {
         // Close the database connection
         await new Promise<void>((resolve, reject) => {
             db.close((err) => {
                 if (err) reject(err);
                 resolve();
             });
         });
     });
    
     beforeEach(async () => {
       await cleanup();
       jest.resetAllMocks();
     });

    const dao = new CoordinatesDAO();
    const controller = new CoordinatesController();
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testCoordinate1 = new Coordinate(1, 5, 100, 200);
    const testCoordinate2 = new Coordinate(2, 10, 200, 100);
    const testCoordinate3 = new Coordinate(3, 1, 150, 150);
    const testDocCoordinate = new DocCoordinates(1, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description", [testCoordinate1, testCoordinate2, testCoordinate3]);
    
});
