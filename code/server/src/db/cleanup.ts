"use strict";

import db from "../db/db";

export async function cleanup() {
    // Helper function to truncate tables
    function clearTable(tableName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM "${tableName}"`, (err) => {
                if (err) {
                    return reject(new Error(`Failed to clear table ${tableName}: ${err.message}`));
                }
                resolve();
            });
        });
    }

    try {
        // Clear tables (order does not matter for `DELETE`)
        await clearTable("sqlite_sequence");
        await clearTable("original_resources");
        await clearTable("document_coordinates");
        await clearTable("documents_links");
        await clearTable("stakeholders_documents");
        await clearTable("users");
        await clearTable("stakeholders");
        await clearTable("links");
        await clearTable("documents");

    } catch (err) {
       
        throw err; // Propagate the error to handle it at a higher level
    }
}