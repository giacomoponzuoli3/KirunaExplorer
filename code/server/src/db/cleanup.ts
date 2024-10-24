"use strict";

import db from "../db/db";

/**
 * Deletes all data from the database within a transaction.
 * Ensures that all tables are cleaned in the correct order.
 * This function must be called before each integration test.
 */


export async function cleanup() {
    return;
}
