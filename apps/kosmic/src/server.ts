import path from 'node:path';
import {KosmicServer} from '@kosmic/server';
import {auth} from './auth.ts';

const routesDir = path.join(import.meta.dirname, 'routes');

export const kosmicServer = new KosmicServer({
  routesDir,
  preRegisterRoutes: auth.initialize,
});
