import type {ApiKey} from './api-keys.ts';
import type {SessionRow} from './sessions.ts';
import type {User} from './users.ts';

export type AuthDatabase = {
  users: User;
  api_keys: ApiKey;
  sessions: SessionRow;
};
