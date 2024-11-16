"use strict";

import db from "../db/db";

export async function cleanup() {
    // Helper function to drop tables
    function dropTable(tableName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(`DROP TABLE IF EXISTS "${tableName}"`, (err) => {
                if (err) {
                    return reject(new Error(`Failed to drop table ${tableName}: ${err.message}`));
                }
                resolve();
            });
        });
    }

    try {
        // Drop tables in reverse order of creation (to handle foreign key dependencies)
        await dropTable("document_coordinates");
        await dropTable("documents_links");
        await dropTable("stakeholders_documents");
        await dropTable("users");
        await dropTable("stakeholders");
        await dropTable("links");
        await dropTable("documents");

        console.log("All tables dropped successfully.");
    } catch (err) {
        console.error(err.message);
        throw err; // Propagate the error to handle it at a higher level
    }
}