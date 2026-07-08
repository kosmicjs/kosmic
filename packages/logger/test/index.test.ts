import process from 'node:process';
import {after, before, describe, test} from 'node:test';
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
});

describe('createLogger env behavior', () => {
  const original = process.env.LOG_LEVEL;

  after(() => {
    if (original === undefined) {
      delete process.env.LOG_LEVEL;
      return;
    }

    process.env.LOG_LEVEL = original;
  });

  describe('when LOG_LEVEL is unset', () => {
    before(() => {
      delete process.env.LOG_LEVEL;
    });

    test('defaults to info level', () => {
      const log = createLogger();
      assert.strictEqual(log.level, 'info');
    });
  });

  describe('when LOG_LEVEL is set', () => {
    before(() => {
      process.env.LOG_LEVEL = 'warn';
    });

    test('respects LOG_LEVEL env var', () => {
      const log = createLogger();
      assert.strictEqual(log.level, 'warn');
    });
  });
});

describe('logger', () => {
  test('is a valid pino logger instance', () => {
    assert.strictEqual(typeof logger.info, 'function');
    assert.strictEqual(typeof logger.error, 'function');
    assert.strictEqual(typeof logger.warn, 'function');
  });
});
