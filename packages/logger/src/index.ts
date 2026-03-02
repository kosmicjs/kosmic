import process from 'node:process';
import {pino, type LoggerOptions, type Logger} from 'pino';

export {
  createPinoMiddleware,
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

export type {Logger, LoggerOptions} from 'pino';
