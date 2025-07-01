import {type User} from './users.js';
import {type Entity} from './entities.js';
import {type Email} from './emails.js';
import {type Sessions} from './sessions.js';

export type Database = {
  users: User;
  entities: Entity;
  emails: Email;
  sessions: Sessions;
};
