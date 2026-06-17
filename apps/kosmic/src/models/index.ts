import type {AuthDatabase} from '@kosmic/auth';
import type {Entity} from './entities.ts';
import type {Email} from './emails.tsx';

declare module '@kosmic/auth' {
  interface AuthDatabase {
    entities: Entity;
    emails: Email;
  }
}

export type Database = AuthDatabase;
