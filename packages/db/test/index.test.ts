import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import db from '../src/index.ts';

describe('db', () => {
  it('should be a function', () => {
    assert.ok(typeof db === 'function');
  });
});
