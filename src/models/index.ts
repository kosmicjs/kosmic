import {type RateLimitAbuse, type RateLimiter} from './rate-limit-abuse.js';
import {type User} from './users.js';
import {type Entity} from './entities.js';
import {type Email} from './emails.js';

export type Database = {
  users: User;
  entities: Entity;
  emails: Email;
  rate_limit_abuse: RateLimitAbuse;
  rate_limiters: RateLimiter;
};

export {type User} from './users.js';

export {type Entity} from './entities.js';
