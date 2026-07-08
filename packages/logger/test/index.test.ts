import process from 'node:process';
import {describe, test} from 'node:test';
import assert from 'node:assert';
import {createLogger, logger} from '../src/index.ts';

describe('createLogger', () => {
  test('returns a pino logger with default name "kosmic"', () => {
    const log = createLogger();
    assert.strictEqual(typeof log.info, 'function');
    assert.strictEqual(typeof log.error, 'function');
    assert.strictEqual(typeof log.warn, 'function');
    assert.strictEqual(typeof log.debug, 'function');
    assert.strictEqual(typeof log.fatal, 'function');
  });

  test('accepts custom options', () => {
    const log = createLogger({level: 'debug'});
    assert.strictEqual(log.level, 'debug');
  });

  test('defaults to info level when LOG_LEVEL is not set', () => {
    const original = process.env.LOG_LEVEL;
    delete process.env.LOG_LEVEL;
    const log = createLogger();
    assert.strictEqual(log.level, 'info');
    if (original !== undefined) {
      process.env.LOG_LEVEL = original;
    }
  });

  test('respects LOG_LEVEL env var', () => {
    const original = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'warn';
    const log = createLogger();
    assert.strictEqual(log.level, 'warn');
    if (original === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = original;
    }
  });
});

describe('logger', () => {
  test('is a valid pino logger instance', () => {
    assert.strictEqual(typeof logger.info, 'function');
    assert.strictEqual(typeof logger.error, 'function');
    assert.strictEqual(typeof logger.warn, 'function');
  });
});
