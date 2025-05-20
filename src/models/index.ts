import {type RateLimitAbuse, type RateLimiter} from './rate-limit-abuse.js';
import {type User} from './users.js';
import {type Entity} from './entities.js';
import {type Email} from './emails.js';
import {type Sessions} from './sessions.js';

export type Database = {
  users: User;
  entities: Entity;
  emails: Email;
  rate_limit_abuse: RateLimitAbuse;
  rate_limiters: RateLimiter;
  sessions: Sessions;
};
