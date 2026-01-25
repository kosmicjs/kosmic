import {test, describe} from 'node:test';
import assert from 'node:assert';
import * as schema from './schema.ts';

const fn = () => {
  // noop
};

describe('schema.ts exports happy path', () => {
  test('middlewareSchema: accepts function', () => {
    const result = schema.middlewareSchema.safeParse(fn);
    assert.ok(result.success, 'Should successfully parse (happy path)');
    if (result.success) {
      assert.strictEqual(result.data, fn);
    }
  });

  test('middlewareArraySchema: accepts array, single, undefined', () => {
    let result = schema.middlewareArraySchema.safeParse([fn]);
    assert.ok(result.success, 'Should accept array of functions');
    result = schema.middlewareArraySchema.safeParse(fn);
    assert.ok(result.success, 'Should accept single function');
    result = schema.middlewareArraySchema.safeParse(undefined);
    assert.ok(result.success, 'Should accept undefined');
  });

  test('useObjectSchema: accepts object with methods as arrays/functions', () => {
    const input = {
      get: [fn],
      post: fn,
      put: undefined,
      patch: undefined,
      delete: undefined,
      all: undefined,
    };
    const result = schema.useObjectSchema.safeParse(input);
    assert.ok(result.success, 'Should successfully parse (happy path)');
  });

  test('useSchema: accepts array of use objects', () => {
    const input = [
      {
        get: fn,
        post: undefined,
        put: undefined,
        patch: undefined,
        delete: undefined,
        all: undefined,
      },
      {
        get: [fn],
        post: fn,
        put: undefined,
        patch: undefined,
        delete: undefined,
        all: undefined,
      },
    ];
    const result = schema.useSchema.safeParse(input);
    assert.ok(result.success, 'Should successfully parse (happy path)');
  });

  test('routeModuleSchema: accepts valid module definition', () => {
    const useObject = {
      get: fn,
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      all: undefined,
    };
    const input = {
      get: fn,
      post: fn,
      put: undefined,
      patch: undefined,
      delete: undefined,
      use: [useObject, useObject],
    };
    const result = schema.routeModuleSchema.safeParse(input);
    assert.ok(result.success, 'Should successfully parse (happy path)');
  });
});
