import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import auth from '../src/index.ts';

describe('auth', () => {
  it('should be a function', () => {
    assert.ok(typeof auth === 'function');
  });
});
