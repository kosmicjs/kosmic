import type {Middleware} from 'koa';
import type {KosmicMigration} from './migrations.ts';

export abstract class KosmicModule {
  abstract middleware: Middleware | undefined;
  abstract migration: KosmicMigration | undefined;
}
