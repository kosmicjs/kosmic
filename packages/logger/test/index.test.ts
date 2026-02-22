import {describe, test} from 'node:test';
import assert from 'node:assert';
import {
  buildLoggerOptions,
  createKosmicLoggers,
  createLogger,
} from '../src/index.ts';

void describe('@kosmic/logger', async () => {
  await test('buildLoggerOptions: omits transport in production', () => {
    const options = buildLoggerOptions({
      name: 'api',
      level: 'info',
      nodeEnv: 'production',
    });

    assert.strictEqual(options.name, 'api');
    assert.strictEqual(options.level, 'info');
    assert.strictEqual(options.transport, undefined);
  });

  await test('buildLoggerOptions: uses pino-princess transport in non-production', () => {
    const options = buildLoggerOptions({
      name: 'api',
      level: 'debug',
      nodeEnv: 'development',
    });

    assert.strictEqual(options.transport?.target, 'pino-princess');
  });

  await test('buildLoggerOptions: supports custom transport target', () => {
    const options = buildLoggerOptions({
      name: 'api',
      level: 'trace',
      nodeEnv: 'test',
      prettyTransportTarget: 'pino/file',
    });

    assert.strictEqual(options.transport?.target, 'pino/file');
  });

  await test('createLogger: creates pino logger with configured bindings', () => {
    const logger = createLogger({
      name: 'api',
      level: 'warn',
      nodeEnv: 'production',
    });

    assert.strictEqual(logger.level, 'warn');
    assert.strictEqual(logger.bindings().name, 'api');
  });

  await test('createKosmicLoggers: creates app and jobs loggers', () => {
    const {logger, jobsLogger} = createKosmicLoggers({
      level: 'info',
      nodeEnv: 'production',
    });

    assert.strictEqual(logger.bindings().name, 'kosmic');
    assert.strictEqual(jobsLogger.bindings().name, '~jobs~');
  });
});
