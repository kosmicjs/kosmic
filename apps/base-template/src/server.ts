import path from 'node:path';
import {KosmicServer} from '@kosmic/server/v2';

const routesDir = path.join(import.meta.dirname, 'routes');

export const kosmicServer = new KosmicServer({
  routesDir,
});
