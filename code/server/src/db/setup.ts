"use strict";

import db from "../db/db";

export async function setup() {
    // Helper function to run SQL queries
    function runQuery(query: string): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(query, (err) => {
                if (err) {
                    return reject(new Error(`Failed to execute query: ${err.message}`));
                }
                resolve();
            });
        });
    }

    try {
        // Create tables
        await runQuery(`CREATE TABLE IF NOT EXISTS "documents" (
            "id" INTEGER NOT NULL UNIQUE,
            "title" TEXT NOT NULL,
            "scale" TEXT NOT NULL,
            "issuance_date" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "language" TEXT,
            "pages" TEXT,
            "description" TEXT,
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        await runQuery(`CREATE TABLE IF NOT EXISTS "links" (
            "id" INTEGER NOT NULL UNIQUE,
            "name" TEXT NOT NULL,
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        await runQuery(`CREATE TABLE IF NOT EXISTS "stakeholders" (
            "id" INTEGER NOT NULL UNIQUE,
            "name" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        await runQuery(`CREATE TABLE IF NOT EXISTS "users" (
            "username" TEXT NOT NULL UNIQUE,
            "name" TEXT NOT NULL,
            "surname" TEXT NOT NULL,
            "role" TEXT NOT NULL,
            "password" TEXT,
            "salt" TEXT,
            PRIMARY KEY("username")
        )`);

        await runQuery(`CREATE TABLE IF NOT EXISTS "stakeholders_documents" (
            "id_stakeholder" INTEGER NOT NULL,
            "id_document" INTEGER NOT NULL,
            PRIMARY KEY("id_document", "id_stakeholder"),
            FOREIGN KEY("id_document") REFERENCES "documents"("id") ON DELETE CASCADE,
            FOREIGN KEY("id_stakeholder") REFERENCES "stakeholders"("id") ON DELETE CASCADE
        )`);

        await runQuery(`CREATE TABLE IF NOT EXISTS "documents_links" (
            "id_document1" INTEGER NOT NULL,
            "id_document2" INTEGER NOT NULL,
            "id_link" TEXT NOT NULL,
            PRIMARY KEY("id_document1", "id_document2", "id_link"),
            FOREIGN KEY("id_document1") REFERENCES "documents"("id") ON DELETE CASCADE,
            FOREIGN KEY("id_document2") REFERENCES "documents"("id") ON DELETE CASCADE,
            FOREIGN KEY("id_link") REFERENCES "links"("id") ON DELETE CASCADE
        )`);

        await runQuery(`CREATE TABLE IF NOT EXISTS "document_coordinates" (
	        "id"	INTEGER,
	        "document_id"	INTEGER NOT NULL,
            "latitude"	REAL,
	        "longitude"	REAL,
	        "point_order"	INTEGER,
	        "municipality_area"	INTEGER NOT NULL,
            PRIMARY KEY("id" AUTOINCREMENT),
	        FOREIGN KEY("document_id") REFERENCES "documents"("id") ON DELETE CASCADE
        )`);

        await runQuery(`CREATE TABLE IF NOT EXISTS "original_resources" (
	        "resource_id"	INTEGER,
	        "document_id"	INTEGER NOT NULL,
	        "resource_name"	TEXT NOT NULL,
	        "resource_data"	BLOB NOT NULL,
	        "uploaded_at"	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	        PRIMARY KEY("resource_id" AUTOINCREMENT),
            FOREIGN KEY("document_id") REFERENCES "documents"("id") ON DELETE CASCADE
        )`);


        console.log("All tables created successfully.");
    } catch (err) {
        console.error(err.message);
        throw err; // Propagate the error to handle it at a higher level
    }
}