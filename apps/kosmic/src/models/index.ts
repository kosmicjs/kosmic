import type {AuthDatabase} from '@kosmic/auth2';
import type {Entity} from './entities.ts';
import type {Email} from './emails.tsx';

declare module '@kosmic/auth2' {
  interface AuthDatabase {
    entities: Entity;
    emails: Email;
  }
}

export type Database = AuthDatabase;
