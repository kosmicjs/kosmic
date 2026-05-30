import {createPassport, type Passport} from '@kosmic/auth';
import {db} from '#db/index.js';
import logger from '#utils/logger.js';

export const passport: Passport = createPassport({
  db,
  logger,
});
