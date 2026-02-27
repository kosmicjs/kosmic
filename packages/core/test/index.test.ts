import assert from 'node:assert';
import {describe, test} from 'node:test';
import {helloWorld} from '../src/index.ts';

void describe('@kosmic/core', async () => {
  await test('helloWorld returns the expected greeting', () => {
    assert.strictEqual(helloWorld(), 'Hello, world!');
  });
});
