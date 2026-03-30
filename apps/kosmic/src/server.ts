import path from 'node:path';
import {KosmicServer} from '@kosmic/server';
import {passport, sessionStore} from './auth.js';

export const kosmicServer = new KosmicServer({
  routesDir: path.join(import.meta.dirname, 'routes'),
  sessionStore,
  passport,
});

export const getServer = (): KosmicServer => kosmicServer;
