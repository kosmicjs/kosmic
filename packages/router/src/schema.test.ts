import {test, describe} from 'node:test';
import assert from 'node:assert';
import * as schema from './schema.ts';

const fn = () => {
  // noop
};

describe('schema.ts exports happy path', () => {
  test('middlewareSchema: accepts function', () => {
    const result = schema.middlewareSchema['~standard'].validate(fn);
    assert.ok('value' in result, 'Should have value property (happy path)');
    assert.strictEqual(result.value, fn);
  });

  test('middlewareArraySchema: accepts array, single, undefined', () => {
    let result = schema.middlewareArraySchema['~standard'].validate([fn]);
    assert.ok('value' in result, 'Should accept array of functions');
    result = schema.middlewareArraySchema['~standard'].validate(fn);
    assert.ok('value' in result, 'Should accept single function');
    result = schema.middlewareArraySchema['~standard'].validate(undefined);
    assert.ok('value' in result, 'Should accept undefined');
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
    const result = schema.useObjectSchema['~standard'].validate(input);
    assert.ok('value' in result, 'Should have value property (happy path)');
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
    const result = schema.useSchema['~standard'].validate(input);
    assert.ok('value' in result, 'Should have value property (happy path)');
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
    const result = schema.routeModuleSchema['~standard'].validate(input);
    assert.ok('value' in result, 'Should have value property (happy path)');
  });
});
