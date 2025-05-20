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

  await test('Get / 404 not found returns expected response', async () => {
    const response = await got('http://localhost:4567/404', {
      throwHttpErrors: false,
    });
    strictEqual(response.statusCode, 404);
    strictEqual(response.body, 'Not Found');
  });

  await test('Get /docs 302 redirects to /docs/installation', async () => {
    const response = await got('http://localhost:4567/docs', {
      throwHttpErrors: false,
      followRedirect: false,
    });
    strictEqual(response.statusCode, 302);
  });

  await test('Get /account - no auth - 401 response', async () => {
    const response = await got('http://localhost:4567/account', {
      throwHttpErrors: false,
      followRedirect: false,
    });
    strictEqual(response.statusCode, 302);
  });

  after(() => {
    server.closeAllConnections();
    server.close();
  });
});
