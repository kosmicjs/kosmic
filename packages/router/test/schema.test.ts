/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable @typescript-eslint/no-empty-function */
import {test, describe} from 'node:test';
import assert from 'node:assert';
import * as schema from '../src/schema.ts';

const fn = () => {
  // noop
};

describe('Router Schema Tests', () => {
  test('middlewareSchema: accepts function', () => {
    let result = schema.middlewareSchema.safeParse(fn);
    assert.ok(result.success, 'Should accept regular function');
    if (result.success) {
      assert.strictEqual(result.data, fn);
    }

    result = schema.middlewareSchema.safeParse(undefined);
    assert.ok(result.success, 'Should accept undefined');

    const arrowFn = () => {};
    result = schema.middlewareSchema.safeParse(arrowFn);
    assert.ok(result.success, 'Should accept arrow function');

    const asyncFn = async () => {};
    result = schema.middlewareSchema.safeParse(asyncFn);
    assert.ok(result.success, 'Should accept async function');

    const generatorFn = function* () {};
    result = schema.middlewareSchema.safeParse(generatorFn);
    assert.ok(result.success, 'Should accept generator function');

    class TestClass {}
    result = schema.middlewareSchema.safeParse(TestClass);
    assert.ok(result.success, 'Should accept class constructor');
  });

  test('middlewareSchema: rejects invalid types', () => {
    let result = schema.middlewareSchema.safeParse('not a function');
    assert.ok(!result.success, 'Should reject string');

    result = schema.middlewareSchema.safeParse(42);
    assert.ok(!result.success, 'Should reject number');

    result = schema.middlewareSchema.safeParse({foo: 'bar'});
    assert.ok(!result.success, 'Should reject object');

    result = schema.middlewareSchema.safeParse(null);
    assert.ok(!result.success, 'Should reject null');

    result = schema.middlewareSchema.safeParse([]);
    assert.ok(!result.success, 'Should reject array');

    result = schema.middlewareSchema.safeParse(true);
    assert.ok(!result.success, 'Should reject boolean');
  });

  test('middlewareArraySchema: accepts array, single, undefined', () => {
    let result = schema.middlewareArraySchema.safeParse([fn]);
    assert.ok(result.success, 'Should accept array with single function');

    result = schema.middlewareArraySchema.safeParse(fn);
    assert.ok(result.success, 'Should accept single function');

    result = schema.middlewareArraySchema.safeParse(undefined);
    assert.ok(result.success, 'Should accept undefined');

    result = schema.middlewareArraySchema.safeParse([]);
    assert.ok(result.success, 'Should accept empty array');

    result = schema.middlewareArraySchema.safeParse([fn, fn, fn]);
    assert.ok(result.success, 'Should accept array with multiple functions');
  });

  test('middlewareArraySchema: rejects invalid types', () => {
    let result = schema.middlewareArraySchema.safeParse([fn, 'not a function']);
    assert.ok(!result.success, 'Should reject array containing non-function');

    result = schema.middlewareArraySchema.safeParse(['foo', 'bar']);
    assert.ok(!result.success, 'Should reject array of non-functions');

    result = schema.middlewareArraySchema.safeParse(null);
    assert.ok(!result.success, 'Should reject null');

    result = schema.middlewareArraySchema.safeParse({foo: fn});
    assert.ok(!result.success, 'Should reject object');

    result = schema.middlewareArraySchema.safeParse(42);
    assert.ok(!result.success, 'Should reject number');

    result = schema.middlewareArraySchema.safeParse('middleware');
    assert.ok(!result.success, 'Should reject string');
  });

  test('useObjectSchema: accepts object with methods as arrays/functions', () => {
    let result = schema.useObjectSchema.safeParse({
      get: [fn],
      post: fn,
      put: undefined,
      patch: undefined,
      delete: undefined,
      all: undefined,
    });
    assert.ok(result.success, 'Should accept mixed arrays and functions');

    result = schema.useObjectSchema.safeParse({
      get: undefined,
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      all: undefined,
    });
    assert.ok(result.success, 'Should accept all properties undefined');

    result = schema.useObjectSchema.safeParse({
      get: fn,
      post: fn,
      put: fn,
      patch: fn,
      delete: fn,
      all: fn,
    });
    assert.ok(result.success, 'Should accept all properties as functions');

    result = schema.useObjectSchema.safeParse({
      get: [fn],
      post: [fn],
      put: [fn],
      patch: [fn],
      delete: [fn],
      all: [fn],
    });
    assert.ok(result.success, 'Should accept all properties as arrays');

    result = schema.useObjectSchema.safeParse({
      get: [fn, fn],
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      all: undefined,
    });
    assert.ok(
      result.success,
      'Should accept partial configuration with only get defined',
    );
  });

  test('useObjectSchema: rejects invalid objects', () => {
    let result = schema.useObjectSchema.safeParse({
      get: 'invalid',
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      all: undefined,
    });
    assert.ok(!result.success, 'Should reject non-function in get property');

    result = schema.useObjectSchema.safeParse({
      get: [fn, 'invalid'],
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      all: undefined,
    });
    assert.ok(!result.success, 'Should reject array with non-function');

    result = schema.useObjectSchema.safeParse(null);
    assert.ok(!result.success, 'Should reject null');

    result = schema.useObjectSchema.safeParse([fn]);
    assert.ok(!result.success, 'Should reject array');

    result = schema.useObjectSchema.safeParse(42);
    assert.ok(!result.success, 'Should reject number');

    result = schema.useObjectSchema.safeParse('string');
    assert.ok(!result.success, 'Should reject string');
  });

  test('useSchema: accepts array of use objects', () => {
    let result = schema.useSchema.safeParse([
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
    ]);
    assert.ok(result.success, 'Should accept array of use objects');

    result = schema.useSchema.safeParse(fn);
    assert.ok(result.success, 'Should accept single middleware function');

    result = schema.useSchema.safeParse([fn, fn]);
    assert.ok(result.success, 'Should accept array of middleware functions');

    result = schema.useSchema.safeParse({
      get: fn,
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      all: undefined,
    });
    assert.ok(result.success, 'Should accept single use object');

    result = schema.useSchema.safeParse([]);
    assert.ok(result.success, 'Should accept empty array');
  });

  test('useSchema: rejects invalid types', () => {
    let result = schema.useSchema.safeParse(null);
    assert.ok(!result.success, 'Should reject null');

    result = schema.useSchema.safeParse('invalid');
    assert.ok(!result.success, 'Should reject string');

    result = schema.useSchema.safeParse(42);
    assert.ok(!result.success, 'Should reject number');

    result = schema.useSchema.safeParse([{get: 'invalid'}]);
    assert.ok(!result.success, 'Should reject array with invalid use object');

    result = schema.useSchema.safeParse(true);
    assert.ok(!result.success, 'Should reject boolean');

    result = schema.useSchema.safeParse({
      get: 'not a function',
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      all: undefined,
    });
    assert.ok(
      !result.success,
      'Should reject use object with invalid property values',
    );
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
    let result = schema.routeModuleSchema.safeParse({
      get: fn,
      post: fn,
      put: undefined,
      patch: undefined,
      delete: undefined,
      use: [useObject, useObject],
    });
    assert.ok(
      result.success,
      'Should accept valid module with multiple use objects',
    );

    result = schema.routeModuleSchema.safeParse({
      get: undefined,
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      use: undefined,
    });
    assert.ok(result.success, 'Should accept all properties undefined');

    result = schema.routeModuleSchema.safeParse({
      get: fn,
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      use: undefined,
    });
    assert.ok(result.success, 'Should accept only get defined');

    result = schema.routeModuleSchema.safeParse({
      get: undefined,
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      use: fn,
    });
    assert.ok(result.success, 'Should accept use as single function');

    result = schema.routeModuleSchema.safeParse({
      get: undefined,
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      use: [fn, fn],
    });
    assert.ok(result.success, 'Should accept use as array of functions');

    result = schema.routeModuleSchema.safeParse({
      get: undefined,
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      use: useObject,
    });
    assert.ok(result.success, 'Should accept use as single use object');

    result = schema.routeModuleSchema.safeParse({
      get: fn,
      post: fn,
      put: fn,
      patch: fn,
      delete: fn,
      use: [useObject, useObject],
    });
    assert.ok(result.success, 'Should accept all HTTP methods defined');
  });

  test('routeModuleSchema: rejects invalid modules', () => {
    let result = schema.routeModuleSchema.safeParse({
      get: 'invalid',
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      use: undefined,
    });
    assert.ok(!result.success, 'Should reject non-function in get property');

    result = schema.routeModuleSchema.safeParse({
      get: undefined,
      post: undefined,
      put: undefined,
      patch: undefined,
      delete: undefined,
      use: 'invalid',
    });
    assert.ok(!result.success, 'Should reject invalid use property');

    result = schema.routeModuleSchema.safeParse(null);
    assert.ok(!result.success, 'Should reject null');

    result = schema.routeModuleSchema.safeParse([fn]);
    assert.ok(!result.success, 'Should reject array');

    result = schema.routeModuleSchema.safeParse(42);
    assert.ok(!result.success, 'Should reject number');

    result = schema.routeModuleSchema.safeParse('string');
    assert.ok(!result.success, 'Should reject string');
  });
});
