import {config} from '@kosmic/config';
import {KosmicDB} from '@kosmic/db';
import type {Database} from '#models/index.js';

export const kosmicDb: KosmicDB<Database> = new KosmicDB<Database>({
  poolConfig: config.db?.pg,
});
