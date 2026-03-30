import {createKosmicAuthFromConfig} from '@kosmic/auth';
import {db} from '#db/index.js';
import logger from '#utils/logger.js';

const kosmicAuth = createKosmicAuthFromConfig({
  db,
  logger,
});

export const {passport} = kosmicAuth;
export const {sessionStore} = kosmicAuth;
export const {authenticateBearer} = kosmicAuth;
export const {authenticateLocal} = kosmicAuth;
