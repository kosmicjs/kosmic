import type {User} from './users.ts';
import type {Entity} from './entities.ts';
import type {Email} from './emails.tsx';
import type {Sessions} from './sessions.ts';
import type {ApiKey} from './api-keys.ts';

export type Database = {
  users: User;
  entities: Entity;
  emails: Email;
  sessions: Sessions;
  api_keys: ApiKey;
};
