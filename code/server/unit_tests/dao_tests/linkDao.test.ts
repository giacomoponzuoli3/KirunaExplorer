import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { LinkDAO } from "../../src/dao/linkDAO";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import Link from "../../src/models/link"
import { LinkNotFoundError, LinkAlreadyExistsError } from "../../src/errors/link";
// Mock the `db` module methods with Jest's `jest.mock` function
jest.mock("../../src/db/db.ts", () => ({
    all: jest.fn(),
    run: jest.fn(),
}));

describe('LinkDAO', () => {
    let linkDAO: LinkDAO;

    beforeEach(() => {
        linkDAO = new LinkDAO();
        jest.clearAllMocks(); // Clear mock history between tests
    });

    describe('addLink', () => {
        test('It should successfully add a link if no existing link is found', async () => {
            // Mock `db.all` to simulate no existing link
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // No duplicate found
                return {} as Database;
            });

            // Mock `db.run` to simulate successful link insertion
            jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                callback(null); // Insertion successful
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.addLink(1, 2, 3)).resolves.toBeUndefined();

            // Verify calls to db.all and db.run with expected SQL and parameters
            expect(db.all).toHaveBeenCalledWith(
                `SELECT * FROM documents_links WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`,
                [1, 2, 2, 1, 3],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenCalledWith(
                'INSERT INTO documents_links(id_document1, id_document2, id_link) VALUES(?, ?, ?)',
                [1, 2, 3],
                expect.any(Function)
            );
        });

        test('It should reject if a duplicate link exists', async () => {
            // Mock `db.all` to simulate duplicate link found
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, [{ id_document1: 1, id_document2: 2, id_link: 3 }]); // Duplicate exists
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.addLink(1, 2, 3)).rejects.toThrow();

            // Ensure `db.run` is not called due to duplicate link
            expect(db.run).not.toHaveBeenCalled();
        });

        test('It should handle errors in db.all gracefully', async () => {
            // Mock `db.all` to simulate an error
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Database error'), []); // Error in `db.all`
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.addLink(1, 2, 3)).rejects.toThrow('Database error');

            // Ensure `db.run` is not called due to the error in `db.all`
            expect(db.run).not.toHaveBeenCalled();
        });

        test('It should handle errors in db.run gracefully', async () => {
            // Mock `db.all` to simulate no existing link found
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // No duplicate
                return {} as Database;
            });

            // Mock `db.run` to simulate an insertion error
            jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Insertion error')); // Error in `db.run`
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.addLink(1, 2, 3)).rejects.toThrow('Insertion error');

            // Verify that `db.all` was called, but `db.run` failed
            expect(db.all).toHaveBeenCalledWith(
                `SELECT * FROM documents_links WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`,
                [1, 2, 2, 1, 3],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenCalledWith(
                'INSERT INTO documents_links(id_document1, id_document2, id_link) VALUES(?, ?, ?)',
                [1, 2, 3],
                expect.any(Function)
            );
        });

    });

    describe('deleteLinks', () => {
        test('It should successfully delete links if found', async () => {
            // Mock `db.run` to simulate successful deletion
            jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                callback(null); // Deletion successful
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.deleteLinks(1, 2, 3)).resolves.toBeUndefined();

            // Verify that db.run was called with the expected SQL and parameters
            expect(db.run).toHaveBeenCalledWith(
                `DELETE FROM documents_links WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`,
                [1, 2, 2, 1, 3],
                expect.any(Function)
            );
        });

        test('It should reject if there is an error during deletion', async () => {
            // Mock `db.run` to simulate an error during deletion
            jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Deletion error')); // Error in `db.run`
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.deleteLinks(1, 2, 3)).rejects.toThrow('Deletion error');

            // Verify that db.run was called
            expect(db.run).toHaveBeenCalledWith(
                `DELETE FROM documents_links WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`,
                [1, 2, 2, 1, 3],
                expect.any(Function)
            );
        });

        test('It should reject with a generic error if an unexpected issue occurs', async () => {
            // Mock db.run to throw a generic error directly
            jest.spyOn(db, 'run').mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            // Act & Assert
            await expect(linkDAO.deleteLinks(1, 2, 3)).rejects.toThrow('Unexpected error');
        });
    });

    describe('updateLink', () => {

        test('It should successfully update a link if the old link exists', async () => {
            // Mock `db.all` to simulate not an already existing new link 
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // Simulate not existing link
                return {} as Database;
            });

            // Mock `db.all` to simulate finding the old link
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, [{ id: 1, name: 'Old Link' }]); // Simulate existing link
                return {} as Database;
            });

            // Mock `db.run` to simulate successful update
            jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                callback(null); // Simulate successful update
                return {} as Database;
            });

            // Act & Assert
            try {
                await linkDAO.updateLink(1, 2, 3, 4);
            } catch (e) {
                expect(e).toBeUndefined(); // Ensure no error is thrown
            }

            // Verify that db.all and db.run were called with the expected parameters
            expect(db.all).toHaveBeenNthCalledWith(
                1,
                `SELECT * FROM documents_links WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`,
                [1, 2, 2, 1, 4],
                expect.any(Function)
            );

            expect(db.all).toHaveBeenNthCalledWith(
                2,
                `SELECT * FROM documents_links WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`,
                [1, 2, 2, 1, 3],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenCalledWith(
                `UPDATE documents_links SET id_link = ? WHERE ((id_document1 = ? AND id_document2 = ?) OR (id_document1 = ? AND id_document2 = ?)) AND id_link = ?`,
                [4, 1, 2, 2, 1, 3],
                expect.any(Function)
            );
        });


        test('It should reject with an error if the new link already exist', async () => {

            // Mock `db.all` to simulate not finding the old link
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, [{ id_link: params[4] }]); // Simulate no existing link found
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.updateLink(1, 2, 3, 4)).rejects.toThrow(LinkAlreadyExistsError);

            // Verify that db.run was not called
            expect(db.run).not.toHaveBeenCalled();
        });

        test('It should reject with an error if the old link does not exist', async () => {

            // Mock `db.all` to simulate not an already existing new link 
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // Simulate not existing link
                return {} as Database;
            });

            // Mock `db.all` to simulate not finding the old link
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // Simulate existing link
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.updateLink(1, 2, 3, 4)).rejects.toThrow(LinkNotFoundError);

            // Verify that db.run was not called
            expect(db.run).not.toHaveBeenCalled();
        });


        test('It should reject with an error if an error occurs in first db.all', async () => {
            // Mock `db.all` to simulate an error
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(new Error('First db.all error')); // Pass an error to the callback
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.updateLink(1, 2, 3, 4)).rejects.toThrow('First db.all error');

            // Verify that db.run was not called
            expect(db.run).not.toHaveBeenCalled();
        });

        test('It should reject with an error if an error occurs in second db.all', async () => {
            // Mock `db.all` to simulate not an already existing new link 
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // Simulate not existing link
                return {} as Database;
            });

            // Mock `db.all` to simulate an error
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Second db.all error')); // Pass an error to the callback
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.updateLink(1, 2, 3, 4)).rejects.toThrow('Second db.all error');

            // Verify that db.run was not called
            expect(db.run).not.toHaveBeenCalled();
        });

        test('It should reject with an error if an error occurs in db.run', async () => {
            // Mock `db.all` to simulate not an already existing new link 
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // Simulate not existing link
                return {} as Database;
            });

            // Mock `db.all` to simulate finding the old link
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, [{ id: 1, name: 'Old Link' }]); // Simulate existing link
                return {} as Database;
            });

            // Mock `db.run` to simulate an error
            jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Update error')); // Simulate error during update
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.updateLink(1, 2, 3, 4)).rejects.toThrow('Update error');

        });

    });


    describe('getAllLinks', () => {
        test('It should return all links successfully', async () => {
            // Mock `db.all` to simulate returning links
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, [{ id: 1, name: 'Link 1' }, { id: 2, name: 'Link 2' }]); // Simulate existing links
                return {} as Database;
            });

            // Act & Assert
            const links = await linkDAO.getAllLinks();

            expect(links).toEqual([
                new Link(1, 'Link 1'),
                new Link(2, 'Link 2'),
            ]);

            // Verify that db.all was called with the expected SQL
            expect(db.all).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM links'),
                [],
                expect.any(Function)
            );
        });

        test('It should reject with an error if no links are found', async () => {
            // Mock `db.all` to simulate no links found
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // Simulate no links found
                return {} as Database;
            });

            // Act & Assert
            try {
                await linkDAO.getAllLinks();
                throw new Error('Expected method to throw an error, but it did not.');
            } catch (err) {
                expect(err.message).toBe('');
            }

            // Verify that db.all was called with the expected SQL
            expect(db.all).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM links'),
                [],
                expect.any(Function)
            );
        });

        test('It should reject with an error if an error occurs in db.all', async () => {
            // Mock `db.all` to simulate an error
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Database error')); // Simulate error
                return {} as Database;
            });

            // Act & Assert
            await expect(linkDAO.getAllLinks()).rejects.toThrow('Database error');
        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.all as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(linkDAO.getAllLinks()).rejects.toThrow("Unexpected error");
        });

    });

});
