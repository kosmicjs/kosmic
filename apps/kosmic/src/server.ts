import path from 'node:path';
import {KosmicServer} from '@kosmic/server';
import {db} from '#db/index.js';

const routesDir = path.join(import.meta.dirname, 'routes');

export const kosmicServer = new KosmicServer({
  db,
  auth: true,
  routesDir,
});
