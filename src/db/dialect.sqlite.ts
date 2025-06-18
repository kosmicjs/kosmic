import process from 'node:process';
import Database from 'better-sqlite3';
import {SqliteDialect} from 'kysely';
import logger from '#utils/logger.js';

const databasePath = process.env.SQLITE_DATABASE ?? './kosmic.db';

const database = new Database(databasePath);

// Enable WAL mode for better concurrency
database.pragma('journal_mode = WAL');

// Enable foreign key constraints
database.pragma('foreign_keys = 1');

// Set busy timeout
database.pragma('busy_timeout = 5000');

logger.trace(`SQLite database initialized at: ${databasePath}`);

export const dialect = new SqliteDialect({
  database,
});
