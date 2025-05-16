import {pino} from 'pino';
import {config} from '#config/index.js';

export const logger = pino({
  name: 'kosmic',
  level: config.logLevel,
  ...(config.nodeEnv === 'production'
    ? {}
    : {transport: {target: 'pino-princess'}}),
});

export const jobsLogger = pino({
  name: '~jobs~',
  level: config.logLevel,
  ...(config.nodeEnv === 'production'
    ? {}
    : {transport: {target: 'pino-princess'}}),
});

export default logger;
