const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const { dbPath } = require("../config/env");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

module.exports = {
  db
};
