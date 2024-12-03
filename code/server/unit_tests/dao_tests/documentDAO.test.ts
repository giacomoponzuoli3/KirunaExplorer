import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { DocumentDAO } from "../../src/dao/documentDAO"
import db from "../../src/db/db"
import { Document } from "../../src/models/document"
import { Stakeholder } from "../../src/models/stakeholder"
import { DocLink } from "../../src/models/document_link"
import { Database } from "sqlite3";
import Link from "../../src/models/link"
import {DocumentNotFoundError} from "../../src/errors/document";
import Resources from "../../src/models/original_resources"

jest.mock("../../src/db/db.ts");


describe('documentDAO', () => {

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const dao = new DocumentDAO();
    const testId = 1;
    const resourceId = 2;
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testDocument = new Document(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
    const testDocument2 = new Document(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2");
    const testDocument3 = new Document(3, "title 3", [testStakeholder2], "1:1", "2020-10-10", "Material effect", "English", "300", "description 3");
    const mockResourceData = new Uint8Array([1, 2, 3, 4]);

    describe('addDocument', () => {
        test('It should successfully add a document', async () => {

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback.bind({ lastID: 1 })(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(
                testDocument
            );

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)',
                ["title", "1:1", "2020-10-10", "Informative document", "English", "300", "description"],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 1],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                3,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 2],
                expect.any(Function)
            );

        });

        test('It should reject if there is an error in document insertion', async () => {
            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Document insertion error'));
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow(`Document insertion error`);

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)',
                ["title", "1:1", "2020-10-10", "Informative document", "English", "300", "description"],
                expect.any(Function)
            );

        });

        test('It should reject if there is an error in first stakeholder insertion', async () => {
            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback.bind({ lastID: 1 })(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('First stakeholder insertion error'));
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow(`First stakeholder insertion error`);

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)',
                ["title", "1:1", "2020-10-10", "Informative document", "English", "300", "description"],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 1],
                expect.any(Function)
            );

        });

        test('It should reject if there is an error in second stakeholder insertion', async () => {
            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback.bind({ lastID: 1 })(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Second stakeholder insertion error'));
                    return {} as Database;
                });

            await expect(dao.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow(`Second stakeholder insertion error`);

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'INSERT INTO documents(title, scale, issuance_date, type, language, pages, description) VALUES(?, ?, ?, ?, ?, ?, ?)',
                ["title", "1:1", "2020-10-10", "Informative document", "English", "300", "description"],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 1],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                3,
                'INSERT INTO stakeholders_documents(id_document, id_stakeholder) VALUES(?, ?)',
                [1, 2],
                expect.any(Function)
            );

        });

        test('It should reject if there is a generic error', async () => {

            jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                throw new Error('Unexpected error');
            });

            await expect(dao.addDocument("title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow(`Unexpected error`);
        });
    });

    describe('getDocumentById', () => {

        test('It should successfully retrieve the document with the specified id', async () => {
            const testRows = [
                {
                    id: testId,
                    title: "title",
                    scale: "1:1",
                    issuance_date: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description",
                    stakeholder_id: 1,
                    stakeholder_name: "John",
                    stakeholder_category: "urban developer"
                },
                {
                    id: testId,
                    title: "title",
                    scale: "1:1",
                    issuance_date: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description",
                    stakeholder_id: 2,
                    stakeholder_name: "Bob",
                    stakeholder_category: "urban developer"
                }
            ];
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, testRows);
                    return {} as Database;
                })

            await expect(dao.getDocumentById(testId)).resolves.toEqual(testDocument);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id WHERE d.id = ?`,
                [testId],
                expect.any(Function)
            );

        });

        test('It should reject if there is no document with the specified id', async () => {
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, null);
                    return {} as Database;
                })

            await expect(dao.getDocumentById(testId)).rejects.toThrow(new DocumentNotFoundError());

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id WHERE d.id = ?`,
                [testId],
                expect.any(Function)
            );

        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Database error'));
                    return {} as Database;
                })

            await expect(dao.getDocumentById(testId)).rejects.toThrow(`Database error`);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id WHERE d.id = ?`,
                [testId],
                expect.any(Function)
            );
        });

        test('It should reject with error if an unexpected error occurs', async () => {
            const unexpectedError = new Error("Unexpected error");
            (db.all as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.getDocumentById(testId)).rejects.toThrow("Unexpected error");
        });
    });

    describe('getAllDocuments', () => {
        test('It should successfully retrieve all the documents', async () => {
            const testRows = [
                {
                    id: testId,
                    title: "title",
                    scale: "1:1",
                    issuance_date: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description",
                    stakeholder_id: 1,
                    stakeholder_name: "John",
                    stakeholder_category: "urban developer"
                },
                {
                    id: testId,
                    title: "title",
                    scale: "1:1",
                    issuance_date: "2020-10-10",
                    type: "Informative document",
                    language: "English",
                    pages: "300",
                    description: "description",
                    stakeholder_id: 2,
                    stakeholder_name: "Bob",
                    stakeholder_category: "urban developer"
                }
            ];
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, testRows);
                    return {} as Database;
                })

            await expect(dao.getAllDocuments()).resolves.toEqual([testDocument]);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id`,
                [],
                expect.any(Function)
            );

        });

        test('It should resolve an empty array if there is no documents', async () => {
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, null);
                    return {} as Database;
                })

            await expect(dao.getAllDocuments()).resolves.toEqual([]);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id`,
                [],
                expect.any(Function)
            );

        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Database error'));
                    return {} as Database;
                })

            await expect(dao.getAllDocuments()).rejects.toThrow(`Database error`);

            expect(db.all).toHaveBeenCalledWith(
                `SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id`,
                [],
                expect.any(Function)
            );

        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.all as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.getAllDocuments()).rejects.toThrow("Unexpected error");
        });
    });

    describe('deleteDocument', () => {
        test('It should successfully delete a document with the specified id', async () => {
            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })

            await expect(dao.deleteDocument(testId)).resolves.toBeUndefined();

            expect(db.run).toHaveBeenCalledWith(
                `DELETE FROM documents WHERE id = ?`,
                [testId],
                expect.any(Function)
            )
        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Database error'));
                    return {} as Database;
                })

            await expect(dao.deleteDocument(testId)).rejects.toThrow(`Database error`);

            expect(db.run).toHaveBeenCalledWith(
                `DELETE FROM documents WHERE id = ?`,
                [testId],
                expect.any(Function)
            )
        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.run as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.deleteDocument(testId)).rejects.toThrow("Unexpected error");
        });
    });

    describe('editDocument', () => {
        test('It should successfully edit a document with the specified id and informations', async () => {

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback.bind({ lastID: 1 })(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.editDocument(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toEqual(
                testDocument
            );

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'UPDATE documents SET title = ?, scale = ?, issuance_date = ?, type = ?, language = ?, pages = ?, description = ? WHERE id = ?',
                ["title", "1:1", "2020-10-10", "Informative document", "English", "300", "description", testId],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'DELETE FROM stakeholders_documents WHERE id_document = ?',
                [testId],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                3,
                'INSERT INTO stakeholders_documents (id_document, id_stakeholder) VALUES (?, ?)',
                [testId, 1],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                4,
                'INSERT INTO stakeholders_documents (id_document, id_stakeholder) VALUES (?, ?)',
                [testId, 2],
                expect.any(Function)
            );
        });

        test('It should reject if there is an error in document update', async () => {
            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error("Update Error"));
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toThrow("Update Error");

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'UPDATE documents SET title = ?, scale = ?, issuance_date = ?, type = ?, language = ?, pages = ?, description = ? WHERE id = ?',
                ["", "", "", "", "", "", "", testId],
                expect.any(Function)
            );
        });

        test('It should reject if there is an error in document delete', async () => {

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback.bind({ lastID: 1 })(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error("Delete Error"));
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toThrow("Delete Error");

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'UPDATE documents SET title = ?, scale = ?, issuance_date = ?, type = ?, language = ?, pages = ?, description = ? WHERE id = ?',
                ["", "", "", "", "", "", "", testId],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'DELETE FROM stakeholders_documents WHERE id_document = ?',
                [testId],
                expect.any(Function)
            );

        });

        test('It should reject if there is an error in first stakeholder insertion', async () => {

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback.bind({ lastID: 1 })(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('First stakeholder insertion error'));
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });

            await expect(dao.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toThrow("First stakeholder insertion error");

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'UPDATE documents SET title = ?, scale = ?, issuance_date = ?, type = ?, language = ?, pages = ?, description = ? WHERE id = ?',
                ["", "", "", "", "", "", "", testId],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'DELETE FROM stakeholders_documents WHERE id_document = ?',
                [testId],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                3,
                'INSERT INTO stakeholders_documents (id_document, id_stakeholder) VALUES (?, ?)',
                [testId, 1],
                expect.any(Function)
            );
        });

        test('It should reject if there is an error in second stakeholder insertion', async () => {

            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback.bind({ lastID: 1 })(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Second stakeholder insertion error'));
                    return {} as Database;
                });

            await expect(dao.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toThrow("Second stakeholder insertion error");

            expect(db.run).toHaveBeenNthCalledWith(
                1,
                'UPDATE documents SET title = ?, scale = ?, issuance_date = ?, type = ?, language = ?, pages = ?, description = ? WHERE id = ?',
                ["", "", "", "", "", "", "", testId],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                2,
                'DELETE FROM stakeholders_documents WHERE id_document = ?',
                [testId],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                3,
                'INSERT INTO stakeholders_documents (id_document, id_stakeholder) VALUES (?, ?)',
                [testId, 1],
                expect.any(Function)
            );

            expect(db.run).toHaveBeenNthCalledWith(
                4,
                'INSERT INTO stakeholders_documents (id_document, id_stakeholder) VALUES (?, ?)',
                [testId, 2],
                expect.any(Function)
            );
        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.run as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.editDocument(testId, "", [testStakeholder1, testStakeholder2], "", "", "", "", "", "")).rejects.toThrow("Unexpected error");
        });
    });

    describe(' getDocumentLinksById', () => {

        const rows = [
            { id_document1: 1, id_document2: 2, link_id: 1, link_name: 'Link A' },
            { id_document1: 1, id_document2: 3, link_id: 2, link_name: 'Link B' },
        ]

        const rowGet1 =  {
            id: 2,
            title: "title 2",
            stakeholder_id: 1,
            stakeholder_name: "John",
            stakeholder_category: "urban developer",
            scale: "1:1",
            issuance_date: "2020-10-10",
            type: "Informative document",
            language: "English",
            pages: "300",
            description: "description 2",
        };

        const rowGet2 =  {
            id: 3,
            title: "title 3",
            stakeholder_id: 2,
            stakeholder_name: "Bob",
            stakeholder_category: "urban developer",
            scale: "1:1",
            issuance_date: "2020-10-10",
            type: "Material effect",
            language: "English",
            pages: "300",
            description: "description 3",
        };

        test("It should retrieve all the DocLinks connected to a document with the specified id", async () => {

            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rows);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 1, name: "John", category: "urban developer" },
                    ]);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 2, name: "Bob", category: "urban developer" },
                    ]);
                    return {} as Database;
                });

            jest.spyOn(db, 'get')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet1);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet2);
                    return {} as Database;
                });
            const result = await dao.getDocumentLinksById(testId);

            expect(result).toEqual([
                new DocLink(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", new Link(1, "Link A")),
                new DocLink(3, "title 3", [testStakeholder2], "1:1", "2020-10-10", "Material effect", "English", "300", "description 3", new Link(2, "Link B"))
            ]);

            expect(db.all).toHaveBeenNthCalledWith(
                1,
                'SELECT dl.id_document1, dl.id_document2, l.id AS link_id, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?',
                [testId, testId],
                expect.any(Function)
            );

            expect(db.all).toHaveBeenNthCalledWith(
                2,
                'SELECT sd.id_stakeholder, s.name, s.category FROM stakeholders_documents sd JOIN stakeholders s ON s.id = sd.id_stakeholder WHERE id_document = ?',
                [testDocument2.id],
                expect.any(Function)
            );

            expect(db.all).toHaveBeenNthCalledWith(
                3,
                'SELECT sd.id_stakeholder, s.name, s.category FROM stakeholders_documents sd JOIN stakeholders s ON s.id = sd.id_stakeholder WHERE id_document = ?',
                [testDocument3.id],
                expect.any(Function)
            );

            expect(db.get).toHaveBeenNthCalledWith(
                1,
                'SELECT * FROM documents WHERE id = ?',
                [testDocument2.id],
                expect.any(Function)
            );

            expect(db.get).toHaveBeenNthCalledWith(
                2,
                'SELECT * FROM documents WHERE id = ?',
                [testDocument3.id],
                expect.any(Function)
            );
        });

        test("It should reject if there is a link error", async () => {

            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error("Link Error"));
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 1, name: "John", category: "urban developer" },
                    ]);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 2, name: "Bob", category: "urban developer" },
                    ]);
                    return {} as Database;
                });

            jest.spyOn(db, 'get')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet1);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet2);
                    return {} as Database;
                });

            await expect(dao.getDocumentLinksById(testId)).rejects.toThrow("Link Error");

            expect(db.all).toHaveBeenNthCalledWith(
                1,
                'SELECT dl.id_document1, dl.id_document2, l.id AS link_id, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?',
                [testId, testId],
                expect.any(Function)
            );

        });

        test("It should return an empty array if there are no links", async () => {

            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, []);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 1, name: "John", category: "urban developer" },
                    ]);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 2, name: "Bob", category: "urban developer" },
                    ]);
                    return {} as Database;
                });

            jest.spyOn(db, 'get')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet1);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet2);
                    return {} as Database;
                });

            await expect(dao.getDocumentLinksById(testId)).resolves.toEqual([]);

            expect(db.all).toHaveBeenNthCalledWith(
                1,
                'SELECT dl.id_document1, dl.id_document2, l.id AS link_id, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?',
                [testId, testId],
                expect.any(Function)
            );

        });

        test("It should reject if there is a first document error", async () => {

            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rows);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 1, name: "John", category: "urban developer" },
                    ]);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 2, name: "Bob", category: "urban developer" },
                    ]);
                    return {} as Database;
                });

            jest.spyOn(db, 'get')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error("First Document Error"));
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet2);
                    return {} as Database;
                });

            await expect(dao.getDocumentLinksById(testId)).rejects.toThrow("First Document Error");

            expect(db.all).toHaveBeenNthCalledWith(
                1,
                'SELECT dl.id_document1, dl.id_document2, l.id AS link_id, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?',
                [testId, testId],
                expect.any(Function)
            );

            expect(db.get).toHaveBeenNthCalledWith(
                1,
                'SELECT * FROM documents WHERE id = ?',
                [testDocument2.id],
                expect.any(Function)
            );

        });

        test("It should reject if there is a second document error", async () => {

            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rows);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 1, name: "John", category: "urban developer" },
                    ]);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 2, name: "Bob", category: "urban developer" },
                    ]);
                    return {} as Database;
                });

            jest.spyOn(db, 'get')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet1);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error("Second Document Error"));
                    return {} as Database;
                });

            await expect(dao.getDocumentLinksById(testId)).rejects.toThrow("Second Document Error");

            expect(db.all).toHaveBeenNthCalledWith(
                1,
                'SELECT dl.id_document1, dl.id_document2, l.id AS link_id, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?',
                [testId, testId],
                expect.any(Function)
            );

            expect(db.get).toHaveBeenNthCalledWith(
                1,
                'SELECT * FROM documents WHERE id = ?',
                [testDocument2.id],
                expect.any(Function)
            );
            expect(db.get).toHaveBeenNthCalledWith(
                2,
                'SELECT * FROM documents WHERE id = ?',
                [testDocument3.id],
                expect.any(Function)
            );
        });

        test("It should reject if there is no document", async () => {

            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rows);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 1, name: "John", category: "urban developer" },
                    ]);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 2, name: "Bob", category: "urban developer" },
                    ]);
                    return {} as Database;
                });

            jest.spyOn(db, 'get')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, null);
                    return {} as Database;
                })

            await expect(dao.getDocumentLinksById(testId)).rejects.toThrow(new DocumentNotFoundError());

            expect(db.all).toHaveBeenNthCalledWith(
                1,
                'SELECT dl.id_document1, dl.id_document2, l.id AS link_id, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?',
                [testId, testId],
                expect.any(Function)
            );

            expect(db.get).toHaveBeenNthCalledWith(
                1,
                'SELECT * FROM documents WHERE id = ?',
                [testDocument2.id],
                expect.any(Function)
            );

        });

        test('It should reject if there is a first stakeholder error', async () => {
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rows);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error("First Stakeholder Error"));
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 2, name: "Bob", category: "urban developer" },
                    ]);
                    return {} as Database;
                });

            jest.spyOn(db, 'get')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet1);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet2);
                    return {} as Database;
                });

            await expect(dao.getDocumentLinksById(testId)).rejects.toThrow("First Stakeholder Error");

            expect(db.all).toHaveBeenNthCalledWith(
                1,
                'SELECT dl.id_document1, dl.id_document2, l.id AS link_id, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?',
                [testId, testId],
                expect.any(Function)
            );

            expect(db.all).toHaveBeenNthCalledWith(
                2,
                'SELECT sd.id_stakeholder, s.name, s.category FROM stakeholders_documents sd JOIN stakeholders s ON s.id = sd.id_stakeholder WHERE id_document = ?',
                [testDocument2.id],
                expect.any(Function)
            );

            expect(db.all).toHaveBeenNthCalledWith(
                3,
                'SELECT sd.id_stakeholder, s.name, s.category FROM stakeholders_documents sd JOIN stakeholders s ON s.id = sd.id_stakeholder WHERE id_document = ?',
                [testDocument3.id],
                expect.any(Function)
            );

            expect(db.get).toHaveBeenNthCalledWith(
                1,
                'SELECT * FROM documents WHERE id = ?',
                [testDocument2.id],
                expect.any(Function)
            );
        });

        test('It should reject if there is a second stakeholder error', async () => {
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rows);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [
                        { id_stakeholder: 1, name: "John", category: "urban developer" },
                    ]);
                    return {} as Database;
                }).mockImplementationOnce((sql, params, callback) => {
                    callback(new Error("Second Stakeholder Error"));
                    return {} as Database;
                });

            jest.spyOn(db, 'get')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet1);
                    return {} as Database;
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, rowGet2);
                    return {} as Database;
                });

            await expect(dao.getDocumentLinksById(testId)).rejects.toThrow("Second Stakeholder Error");

            expect(db.all).toHaveBeenNthCalledWith(
                1,
                'SELECT dl.id_document1, dl.id_document2, l.id AS link_id, l.name AS link_name FROM documents_links dl JOIN links l ON dl.id_link = l.id WHERE dl.id_document1 = ? OR dl.id_document2 = ?',
                [testId, testId],
                expect.any(Function)
            );

            expect(db.all).toHaveBeenNthCalledWith(
                2,
                'SELECT sd.id_stakeholder, s.name, s.category FROM stakeholders_documents sd JOIN stakeholders s ON s.id = sd.id_stakeholder WHERE id_document = ?',
                [testDocument2.id],
                expect.any(Function)
            );

            expect(db.all).toHaveBeenNthCalledWith(
                3,
                'SELECT sd.id_stakeholder, s.name, s.category FROM stakeholders_documents sd JOIN stakeholders s ON s.id = sd.id_stakeholder WHERE id_document = ?',
                [testDocument3.id],
                expect.any(Function)
            );

            expect(db.get).toHaveBeenNthCalledWith(
                1,
                'SELECT * FROM documents WHERE id = ?',
                [testDocument2.id],
                expect.any(Function)
            );

            expect(db.get).toHaveBeenNthCalledWith(
                2,
                'SELECT * FROM documents WHERE id = ?',
                [testDocument3.id],
                expect.any(Function)
            );
        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.all as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.getDocumentLinksById(testId)).rejects.toThrow("Unexpected error");
        });

    });

    describe(' getDocumentTitleById', () => {

        test("It should retrieve the title of a document with the specified id", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, { title: "title" });
                return {} as Database;
            })

            await expect(dao.getDocumentTitleById(testId)).resolves.toEqual("title");

            expect(db.get).toHaveBeenCalledWith(
                'SELECT title FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });

        test("It should reject if there is an error with select", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(new Error("Select Error"));
                return {} as Database;
            })

            await expect(dao.getDocumentTitleById(testId)).rejects.toThrow("Select Error");

            expect(db.get).toHaveBeenCalledWith(
                'SELECT title FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });

        test("It should reject if there is no document with the specified id", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            })

            await expect(dao.getDocumentTitleById(testId)).rejects.toThrow(new DocumentNotFoundError());

            expect(db.get).toHaveBeenCalledWith(
                'SELECT title FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.get as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.getDocumentTitleById(testId)).rejects.toThrow("Unexpected error");
        });
    });

    describe(' getDocumentDescriptionById', () => {

        test("It should retrieve the description of a document with the specified id", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, { description: "description" });
                return {} as Database;
            })

            await expect(dao.getDocumentDescriptionById(testId)).resolves.toEqual("description");

            expect(db.get).toHaveBeenCalledWith(
                'SELECT description FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });

        
        test("It should return null if there is no description", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, { description: null });
                return {} as Database;
            })

            await expect(dao.getDocumentDescriptionById(testId)).resolves.toEqual("No description available...");

            expect(db.get).toHaveBeenCalledWith(
                'SELECT description FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });


        test("It should reject if there is an error with select", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(new Error("Select Error"));
                return {} as Database;
            })

            await expect(dao.getDocumentDescriptionById(testId)).rejects.toThrow("Select Error");

            expect(db.get).toHaveBeenCalledWith(
                'SELECT description FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });

        test("It should reject if there is no document with the specified id", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            })

            await expect(dao.getDocumentDescriptionById(testId)).rejects.toThrow(new DocumentNotFoundError());

            expect(db.get).toHaveBeenCalledWith(
                'SELECT description FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.get as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.getDocumentDescriptionById(testId)).rejects.toThrow("Unexpected error");

        });
    });
    
    describe(' getDocumentIssuanceDateById', () => {

        test("It should retrieve the IssuanceDate of a document with the specified id", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, { issuance_date: "issuanceDate" });
                return {} as Database;
            })

            await expect(dao.getDocumentIssuanceDateById(testId)).resolves.toEqual("issuanceDate");

            expect(db.get).toHaveBeenCalledWith(
                'SELECT issuance_date FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });

        test("It should reject if there is an error with select", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(new Error("Select Error"));
                return {} as Database;
            })

            await expect(dao.getDocumentIssuanceDateById(testId)).rejects.toThrow("Select Error");

            expect(db.get).toHaveBeenCalledWith(
                'SELECT issuance_date FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });

        test("It should reject if there is no document with the specified id", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            })

            await expect(dao.getDocumentIssuanceDateById(testId)).rejects.toThrow(new DocumentNotFoundError());

            expect(db.get).toHaveBeenCalledWith(
                'SELECT issuance_date FROM documents WHERE id = ?',
                [testId],
                expect.any(Function)
            );

        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.get as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.getDocumentIssuanceDateById(testId)).rejects.toThrow("Unexpected error");
            
        });
    });

    describe(' getAllDocumentsOfSameType', () => {

        test("It should retrieve all the documents with the same type", async () => {

            const testRows = [
                {
                    id: 3,
                    title: "title 3",
                    stakeholder_id: 2,
                    stakeholder_name: "Bob",
                    stakeholder_category: "urban developer",
                    scale: "1:1",
                    issuance_date: "2020-10-10",
                    type: "Material effect",
                    language: "English",
                    pages: "300",
                    description: "description 3",
                }
            ];

            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, testRows);
                return {} as Database;
            })

            await expect(dao.getAllDocumentsOfSameType("Material effect")).resolves.toEqual([testDocument3]);

            expect(db.all).toHaveBeenCalledWith(
                'SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id WHERE d.type = ?',
                ["Material effect"],
                expect.any(Function)
            );

        });

        test("It should reject if there is an error with select", async () => {

            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(new Error("Select Error"));
                return {} as Database;
            })

            await expect(dao.getAllDocumentsOfSameType("Material effect")).rejects.toThrow("Select Error");

            expect(db.all).toHaveBeenCalledWith(
                'SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id WHERE d.type = ?',
                ["Material effect"],
                expect.any(Function)
            );

        });

        test("It should resolve with an empty array if there is no document with the specified type", async () => {
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            })

            await expect(dao.getAllDocumentsOfSameType("Material effect")).resolves.toEqual([]);

            expect(db.all).toHaveBeenCalledWith(
                'SELECT d.*, s.id AS stakeholder_id, s.name AS stakeholder_name, s.category AS stakeholder_category FROM documents d JOIN stakeholders_documents sd ON d.id = sd.id_document JOIN stakeholders s ON sd.id_stakeholder = s.id WHERE d.type = ?',
                ["Material effect"],
                expect.any(Function)
            );

        });

        test("It should reject with error if an unexpected error occurs", async () => {

            const unexpectedError = new Error("Unexpected error");
            (db.all as jest.Mock).mockImplementation(() => {
                throw unexpectedError;
            });

            await expect(dao.getAllDocumentsOfSameType("Material effect")).rejects.toThrow("Unexpected error");
    
        });
    });

    describe(' addResourceToDocument', () => {
        test("It should adds a resource to the specified document in the database", async () => {
            jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                callback(null);
                return {} as Database;
            })
    
            await expect(dao.addResourceToDocument(testId, "title", "2020-10-10")).resolves.toBeUndefined();

            expect(db.run).toHaveBeenCalledWith(
                'INSERT INTO original_resources (document_id, resource_name, resource_data) VALUES (?, ?, ?)',
                [testId, "title",  Buffer.from("2020-10-10", 'base64')],
                expect.any(Function)
            );
    
        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(db, 'run')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Database error'));
                    return {} as Database;
                })

             await expect(dao.addResourceToDocument(testId, "title", "2020-10-10")).rejects.toThrow('Database error');
        });

        test('should reject when the database returns an error', async () => {
    
            jest.spyOn(db, 'run')
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Unexpected error'));
                return {} as Database;
            })

            await expect(dao.addResourceToDocument(testId, "title", "2020-10-10")).rejects.toThrow('Unexpected error');
    
        });
    });

    describe(' getResourceData', () => {
        test("It should get a specific resource to the specified document in the database", async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, { resource_data: mockResourceData });
                return {} as Database;
            })

            await expect(dao.getResourceData(testId, resourceId)).resolves.toEqual(mockResourceData);

            expect(db.get).toHaveBeenCalledWith(
                'SELECT resource_data FROM original_resources WHERE document_id = ? AND resource_id = ?',
                [testId, resourceId],
                expect.any(Function)
            );
    
        });

        test('should reject with DocumentNotFoundError when no row is found', async () => {
            jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, null); // Simulate no row found
                return {} as Database;
            });
    
            await expect(dao.getResourceData(testId, resourceId)).rejects.toThrow(DocumentNotFoundError);
    
            expect(db.get).toHaveBeenCalledWith(
                "SELECT resource_data FROM original_resources WHERE document_id = ? AND resource_id = ?",
                [testId, resourceId],
                expect.any(Function)
            );
        });

        test('It should reject if there is a database error', async () => {
            jest.spyOn(db, 'get')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('Database error'));
                    return {} as Database;
                })

             await expect(dao.getResourceData(testId, resourceId)).rejects.toThrow('Database error');
        });

        test('should reject when the database returns an error', async () => {
    
            jest.spyOn(db, 'get')
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error('Unexpected error'));
                return {} as Database;
            })

            await expect(dao.getResourceData(testId, resourceId)).rejects.toThrow('Unexpected error');
    
        });
    });

    describe('getAllResourcesData', () => {
    
        test('should resolve with an array of resources when rows are returned', async () => {
            const mockRows = [
                {
                    document_id: 1,
                    resource_id: 1,
                    resource_name: 'Resource 1',
                    uploaded_at: new Date('2024-12-01T12:00:00Z'),
                },
                {
                    document_id: 1,
                    resource_id: 2,
                    resource_name: 'Resource 2',
                    uploaded_at: new Date('2024-12-02T12:00:00Z'),
                },
            ];
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, mockRows);
                return {} as Database;
            });
    
            const expectedResources: Resources[] = [
                { id: 1, idDoc: 1, data: null, name: 'Resource 1', uploadTime: new Date('2024-12-01T12:00:00Z') },
                { id: 2, idDoc: 1, data: null, name: 'Resource 2', uploadTime: new Date('2024-12-02T12:00:00Z') },
            ];
    
            const result = await dao.getAllResourcesData(1);
    
            expect(result).toEqual(expectedResources);
            expect(db.all).toHaveBeenCalledWith(
                "SELECT resource_id, resource_name, uploaded_at,document_id FROM original_resources WHERE document_id = ?",
                [1],
                expect.any(Function)
            );
        });
    
        test('should resolve with an empty array when no rows are returned', async () => {
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(null, []); // Simulate no rows
                return {} as Database;
            });
    
            const result = await dao.getAllResourcesData(testId);
    
            expect(result).toEqual([]);
            expect(db.all).toHaveBeenCalledWith(
                "SELECT resource_id, resource_name, uploaded_at,document_id FROM original_resources WHERE document_id = ?",
                [testId],
                expect.any(Function)
            );
        });
    
        test('should reject with an error when the database query fails', async () => {
            const mockError = new Error('Database error');
            jest.spyOn(db, 'all').mockImplementationOnce((sql, params, callback) => {
                callback(mockError, null); // Simulate database error
                return {} as Database;
            });
    
            await expect(dao.getAllResourcesData(testId)).rejects.toThrow('Database error');
    
            expect(db.all).toHaveBeenCalledWith(
                "SELECT resource_id, resource_name, uploaded_at,document_id FROM original_resources WHERE document_id = ?",
                [testId],
                expect.any(Function)
            );
        });

        describe('deleteResource', () => {
            
        
            test('should resolve when the resource is successfully deleted', async () => {
                jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                    callback(null); // Simulate successful deletion
                    return {} as Database;
                });
        
                await expect(dao.deleteResource(testId, "Resource 1")).resolves.not.toThrow();
        
                expect(db.run).toHaveBeenCalledWith(
                    "DELETE FROM original_resources WHERE document_id = ? AND resource_name = ?",
                    [testId, "Resource 1"],
                    expect.any(Function)
                );
            });
        
            test('should reject with an error when the database query fails', async () => {
                const mockError = new Error('Database error');
                jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                    callback(mockError); // Simulate database error
                    return {} as Database;
                });
        
                await expect(dao.deleteResource(testId, "Resource 1")).rejects.toThrow('Database error');
        
                expect(db.run).toHaveBeenCalledWith(
                    "DELETE FROM original_resources WHERE document_id = ? AND resource_name = ?",
                    [testId, "Resource 1"],
                    expect.any(Function)
                );
            });
        
            test('should resolve even if no rows are affected by the deletion query', async () => {
                jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                    callback(null); // Simulate no error but no rows affected
                    return {} as Database;
                });
        
                await expect(dao.deleteResource(testId, "Resource 1")).resolves.not.toThrow();
        
                expect(db.run).toHaveBeenCalledWith(
                    "DELETE FROM original_resources WHERE document_id = ? AND resource_name = ?",
                    [testId, "Resource 1"],
                    expect.any(Function)
                );
            });
        });
    });
});
