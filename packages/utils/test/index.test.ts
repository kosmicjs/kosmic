import {test, describe} from 'node:test';
import assert from 'node:assert';
import {capitalize, clamp, slugify} from '@kosmic/utils';

void describe('@kosmic/utils', async () => {
  await test('capitalize: capitalizes first letter', () => {
    assert.ok(capitalize('hello'), 'Hello');
    assert.strictEqual(capitalize('world'), 'World');
    assert.strictEqual(capitalize(''), '');
  });

  await test('clamp: constrains number within range', () => {
    assert.strictEqual(clamp(5, 0, 10), 5);
    assert.strictEqual(clamp(-5, 0, 10), 0);
    assert.strictEqual(clamp(15, 0, 10), 10);
  });

  await test('slugify: creates URL-friendly slug', () => {
    assert.strictEqual(slugify('Hello World'), 'hello-world');
    assert.strictEqual(slugify('Hello  World!'), 'hello-world');
    assert.strictEqual(slugify('  Trim Me  '), 'trim-me');
  });
});
