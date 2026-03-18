import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {KosmicDB} from '../src/index.ts';

describe('db', () => {
  it('should exist', () => {
    assert.ok(KosmicDB);
  });
});
