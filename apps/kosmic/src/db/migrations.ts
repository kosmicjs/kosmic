import {
  AddAuditTriggersMigration,
  ApiKeysMigration,
  AuditLogMigration,
  EmailsMigration,
  EntitiesMigration,
  SessionsMigration,
  TriggerMigration,
  UsersMigration,
} from '@kosmic/core';

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

/**
 * Create the entities table
 */
export const entities = new EntitiesMigration({
  sequence: '2025-01-03',
});

/**
 * Create the emails table
 */
export const emails = new EmailsMigration({
  sequence: '2025-01-04',
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

export const auditLog = new AuditLogMigration({
  sequence: '2025-01-07',
});

export const addAuditTriggers = new AddAuditTriggersMigration({
  sequence: '2025-01-08',
});
