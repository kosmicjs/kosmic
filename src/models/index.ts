import {type User} from './users.js';
import {type Entity} from './entities.js';
import {type Email} from './emails.js';

export type Database = {
  users: User;
  entities: Entity;
  emails: Email;
};

export {type User} from './users.js';

export {type Entity} from './entities.js';
