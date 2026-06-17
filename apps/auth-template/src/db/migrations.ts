import {SessionsMigration, UsersMigration} from '@kosmic/auth/migrations';

export const users = new UsersMigration({
  sequence: '2026-06-17-01',
});

export const sessions = new SessionsMigration({
  sequence: '2026-06-17-02',
});
