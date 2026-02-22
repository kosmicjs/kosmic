import {createKosmicLoggers} from '@kosmic/logger';
import {config} from '#config/index.js';

export const {logger, jobsLogger} = createKosmicLoggers({
  level: config.logLevel,
  nodeEnv: config.nodeEnv,
});

export default logger;
