import {logger} from '@kosmic/logger';

export {logger, logger as default} from '@kosmic/logger';

export const jobsLogger = logger.child({name: 'jobs'});
