import process from 'node:process';
import {pino, type LoggerOptions, type Logger} from 'pino';
import {loggerStorage} from './http.ts';

export {
  createPinoMiddleware,
  loggerStorage,
  type PinoHttpOptions,
  type CreatePinoMiddlewareConfig,
} from './http.ts';

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

export const getLogger = () => loggerStorage.getStore() ?? logger;

export type {Logger, LoggerOptions} from 'pino';
