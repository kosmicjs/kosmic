import {type Server} from 'node:http';
import {describe, test, before, after} from 'node:test';
import {strictEqual} from 'node:assert';
import got from 'got';
import * as cheerio from 'cheerio';
import {createServer} from '../src/server.js';

await describe('server integration', async () => {
  let server: Server;

  before(async () => {
    server = await createServer();
    server.listen(4567);
  });

  await test('GET / 200 ok', async () => {
    const response = await got('http://localhost:4567');

    strictEqual(response.statusCode, 200);

    const $ = cheerio.load(response.body);
    const $h1 = $('h1');
    strictEqual($h1.length, 1);
    strictEqual($h1.text(), 'Kosmic');
  });

  after(() => {
    server.closeAllConnections();
    server.close();
  });
});
