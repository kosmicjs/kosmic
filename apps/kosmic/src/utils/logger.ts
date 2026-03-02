import {createLogger} from '@kosmic/logger';
import {config} from '@kosmic/config';

export const jobsLogger = createLogger({name: 'jobs'});

export const logger = createLogger({level: config.logLevel});

export default logger;
