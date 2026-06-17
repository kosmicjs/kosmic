import {TriggerMigration} from '@kosmic/db/migrations';
import {
  ApiKeysMigration,
  SessionsMigration,
  UsersMigration,
} from '@kosmic/auth/migrations';

/**
 * Create a trigger function to update the updated_at column
 * on every update of the table.
 */
export const triggers = new TriggerMigration({
  sequence: '2025-01-01',
});

/**
 * Create the users table
 */
export const users = new UsersMigration({
  sequence: '2025-01-02',
});

export const sessions = new SessionsMigration({
  sequence: '2025-01-05',
});

/**
 * Create the api_keys table for OWASP-compliant API key management
 */
export const apiKeys = new ApiKeysMigration({
  sequence: '2025-01-06',
});
