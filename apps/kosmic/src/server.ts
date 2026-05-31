import path from 'node:path';
import {KosmicServer} from '@kosmic/server';
import {db} from '#db/index.js';

export const kosmicServer = new KosmicServer({
  db,
  auth: true,
  routesDir: path.join(import.meta.dirname, 'routes'),
});
