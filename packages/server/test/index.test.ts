import {test, describe} from 'node:test';
import assert from 'node:assert';
import {createTitle, createConfig} from '../src/index.ts';

void describe('@spence-s/core', async () => {
  void test('createTitle: capitalizes all words', () => {
    assert.strictEqual(createTitle('hello world'), 'Hello World');
    assert.strictEqual(createTitle('foo bar baz'), 'Foo Bar Baz');
  });

  await test('createConfig: creates proper config object', () => {
    const config = createConfig('my project', 'A test project');
    assert.strictEqual(config.name, 'My Project');
    assert.strictEqual(config.slug, 'my-project');
    assert.strictEqual(config.description, 'A test project');
  });
});
