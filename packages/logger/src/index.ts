import process from 'node:process';
import {pino, type LoggerOptions} from 'pino';

export function createLogger(options: LoggerOptions = {}) {
  return pino({
    name: 'kosmic',
    level: process.env.LOG_LEVEL ?? 'info',
    ...(process.env.NODE_ENV === 'production'
      ? {}
      : {
          transport: {
            target: 'pino-princess',
          },
        }),
    ...options,
  });
}

export const logger = createLogger();
