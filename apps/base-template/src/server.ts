import path from 'node:path';
import {KosmicServer} from '@kosmic/server';

const routesDir = path.join(import.meta.dirname, 'routes');

// @ts-expect-error - gotta fix this
export const kosmicServer = new KosmicServer({
  routesDir,
});
