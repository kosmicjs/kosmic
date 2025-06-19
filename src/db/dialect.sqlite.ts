import Database from 'better-sqlite3';
import {SqliteDialect} from 'kysely';
import {config} from '#config/index.js';

const databasePath = config.db.sqlite.filename;

const database = new Database(databasePath);

// Enable WAL mode for better concurrency
database.pragma('journal_mode = WAL');

// Enable foreign key constraints
database.pragma('foreign_keys = 1');

// Set busy timeout
database.pragma('busy_timeout = 5000');

export const dialect = new SqliteDialect({
  database,
});
