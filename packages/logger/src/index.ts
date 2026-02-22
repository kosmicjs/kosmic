import {pino, type Logger, type LoggerOptions} from 'pino';

export type LoggerEnvironment =
  | 'production'
  | 'development'
  | 'test'
  | (string & {});

export type CreateLoggerOptions = {
  name: string;
  level: string;
  nodeEnv: LoggerEnvironment;
  prettyTransportTarget?: string;
};

export type CreateKosmicLoggersOptions = {
  level: string;
  nodeEnv: LoggerEnvironment;
  appName?: string;
  jobsName?: string;
  prettyTransportTarget?: string;
};

export type KosmicLoggerOptions = {
  name: string;
  level: string;
  transport?: {
    target: string;
  };
};

export function buildLoggerOptions(
  options: CreateLoggerOptions,
): KosmicLoggerOptions {
  if (options.nodeEnv === 'production') {
    return {
      name: options.name,
      level: options.level,
    };
  }

  return {
    name: options.name,
    level: options.level,
    transport: {
      target: options.prettyTransportTarget ?? 'pino-princess',
    },
  };
}

export function createLogger(options: CreateLoggerOptions): Logger {
  return pino(buildLoggerOptions(options) as LoggerOptions);
}

export function createKosmicLoggers(options: CreateKosmicLoggersOptions): {
  logger: Logger;
  jobsLogger: Logger;
} {
  const sharedOptions =
    options.prettyTransportTarget === undefined
      ? {}
      : {prettyTransportTarget: options.prettyTransportTarget};

  return {
    logger: createLogger({
      name: options.appName ?? 'kosmic',
      level: options.level,
      nodeEnv: options.nodeEnv,
      ...sharedOptions,
    }),
    jobsLogger: createLogger({
      name: options.jobsName ?? '~jobs~',
      level: options.level,
      nodeEnv: options.nodeEnv,
      ...sharedOptions,
    }),
  };
}
