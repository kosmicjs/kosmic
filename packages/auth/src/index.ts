import type {Middleware} from 'koa'; // eslint-disable-line import-x/no-extraneous-dependencies, n/no-extraneous-import
import {KosmicModule, type KosmicMigration} from '@kosmic/core';

export class KosmicAuth extends KosmicModule {
  migration: undefined;
  middleware: Middleware = async (ctx, next) => {
    //
  };
}
