import { describe, afterEach, test, expect, jest } from "@jest/globals"
import { DocumentDAO } from "../../src/dao/documentDAO"
import db from "../../src/db/db"
import { Document } from "../../src/models/document"
import { Stakeholder } from "../../src/models/stakeholder"
import { DocLink } from "../../src/models/document_link"
import { Database } from "sqlite3";

jest.mock("../../src/db/db.ts");


describe('documentDAO', () => {

    afterEach(() => {
        // better use jest.resetAllMocks() instead of jest.clearAllMocks() for avoiding possible errors
        jest.resetAllMocks();
    });

    const dao = new DocumentDAO();
    const testId = 1;
    const testStakeholder1 = new Stakeholder(1, "John", "urban developer");
    const testStakeholder2 = new Stakeholder(2, "Bob", "urban developer");
    const testDocument = new Document(testId, "title", [testStakeholder1, testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description");
    const testDocument2 = new Document(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2");
    const testDocument3 = new Document(3, "title 3", [testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description 3");

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

            await expect(dao.addDocument("title", [1, 2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).resolves.toBeUndefined();

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

            await expect(dao.addDocument("title", [1, 2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow(`Document insertion error`);

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

            await expect(dao.addDocument("title", [1, 2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow(`First stakeholder insertion error`);

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

            await expect(dao.addDocument("title", [1, 2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow(`Second stakeholder insertion error`);

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

            await expect(dao.addDocument("title", [1, 2], "1:1", "2020-10-10", "Informative document", "English", "300", "description")).rejects.toThrow(`Unexpected error`);
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

            await expect(dao.getDocumentById(testId)).rejects.toThrow(`Document not found.`);

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

        test('It should reject if there is no dcuments', async () => {
            jest.spyOn(db, 'all')
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, null);
                    return {} as Database;
                })

            await expect(dao.getAllDocuments()).rejects.toThrow(`No documents found.`);

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

            await expect(dao.editDocument(testId, "", [1, 2], "", "", "", "", "", "")).resolves.toBeUndefined();

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

            await expect(dao.editDocument(testId, "", [1, 2], "", "", "", "", "", "")).rejects.toThrow("Update Error");

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

            await expect(dao.editDocument(testId, "", [1, 2], "", "", "", "", "", "")).rejects.toThrow("Delete Error");

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

            await expect(dao.editDocument(testId, "", [1, 2], "", "", "", "", "", "")).rejects.toThrow("First stakeholder insertion error");

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

            await expect(dao.editDocument(testId, "", [1, 2], "", "", "", "", "", "")).rejects.toThrow("Second stakeholder insertion error");

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

            await expect(dao.editDocument(testId, "", [1, 2], "", "", "", "", "", "")).rejects.toThrow("Unexpected error");
        });
    });

    describe(' getDocumentLinksById', () => {

        const rows = [
            { id_document1: 1, id_document2: 2, link_name: 'Link A' },
            { id_document1: 1, id_document2: 3, link_name: 'Link B' },
        ]

        test("It should retrieve all the docLinks connected to a document with the specified", async () => {

            jest.spyOn(db, 'all')
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, rows);
                return {} as Database;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, [testDocument2,testDocument3]);
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
    
            const result = await dao.getDocumentLinksById(testId);
    
            expect(result).toEqual([
                new DocLink(2, "title 2", [testStakeholder1], "1:1", "2020-10-10", "Informative document", "English", "300", "description 2", "Link A"),
                new DocLink(3, "title 3", [testStakeholder2], "1:1", "2020-10-10", "Informative document", "English", "300", "description 3", "Link B")
            ]);
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
    });
});