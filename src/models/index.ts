import {type User} from './users.js';
import {type Entity} from './entities.js';
import {type Email} from './emails.js';
import {type Sessions} from './sessions.js';
import {type ApiKey} from './api-keys.js';

export type Database = {
  users: User;
  entities: Entity;
  emails: Email;
  sessions: Sessions;
  api_keys: ApiKey;
};
