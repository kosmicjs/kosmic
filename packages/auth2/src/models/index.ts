import type {ApiKey} from './api-keys.ts';
import type {SessionRow} from './sessions.ts';
import type {User} from './users.ts';

export interface AuthDatabase {
  [key: string]: Record<string, unknown>;
  users: User;
  api_keys: ApiKey;
  sessions: SessionRow;
}

export * from './api-keys.ts';
export * from './sessions.ts';
export * from './users.ts';
