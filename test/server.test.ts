import {type Server} from 'node:http';
import {describe, test, before, after} from 'node:test';
import {strictEqual, rejects} from 'node:assert';
import _got from 'got';
import * as cheerio from 'cheerio';
import {NO_MIGRATIONS} from 'kysely';
import {CookieJar} from 'tough-cookie';
import {createServer} from '../src/server.js';
import {migrator} from '#db/utils/migrator.js';
import {db} from '#db/index.js';

await describe('server integration', async () => {
  let server: Server;

  const got = _got.extend({
    prefixUrl: 'http://localhost:4567',
    throwHttpErrors: false,
    cookieJar: new CookieJar(),
    followRedirect: false,
  });

  before(async () => {
    server = await createServer();
    await migrator.migrateToLatest();
    server.listen(4567);
  });

  await test('GET / 200 ok', async () => {
    const response = await got('');

    strictEqual(response.statusCode, 200);

    const $ = cheerio.load(response.body);
    const $h1 = $('h1');
    strictEqual($h1.length, 1);
    strictEqual($h1.text(), 'Kosmic');
  });

  await test('Get / 404 not found returns expected response', async () => {
    const response = await got('404', {
      throwHttpErrors: false,
    });
    strictEqual(response.statusCode, 404);
    strictEqual(response.body, 'Not Found');
  });

  await test('Get /docs 302 redirects to /docs/installation', async () => {
    const response = await got('docs', {
      throwHttpErrors: false,
      followRedirect: false,
    });
    strictEqual(response.statusCode, 302);
  });

  await test('Get /account - no auth - 401 response', async () => {
    const response = await got('account', {
      throwHttpErrors: false,
      followRedirect: false,
    });
    strictEqual(response.statusCode, 302);
  });

  await test.only('POST /signup success - 302 redirect', async () => {
    const email = `test-${Date.now()}@test.com`;

    const response = await got.post('signup', {
      json: {
        email,
        password: 'Test@1234',
        password_confirm: 'Test@1234',
      },
    });

    strictEqual(response.statusCode, 302);

    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirstOrThrow();

    strictEqual(user.email, email);
    strictEqual(user.first_name, null);
    strictEqual(user.last_name, null);

    const welcomeEmail = await db
      .selectFrom('emails')
      .selectAll()
      .where('to', '=', email)
      .executeTakeFirst();

    strictEqual(welcomeEmail?.to, email);
    strictEqual(welcomeEmail?.status, 'pending');
  });

  await test('GET /account - after signup - 200 response', async () => {
    const response = await got('account');
    strictEqual(response.statusCode, 200);
  });

  await test('GET /logout - after signup - 302 response', async () => {
    const response = await got('logout');
    strictEqual(response.statusCode, 302);
  });

  await test('POST /signup - invalid email 400 response', async () => {
    const email = `test-${Date.now()}@test`;

    const response = await got.post('signup', {
      json: {
        email,
        password: 'test1234',
        password_confirm: 'test1234',
      },
    });

    strictEqual(response.statusCode, 400);
    await rejects(
      db.selectFrom('users').selectAll().where('email', '=', email)
        .executeTakeFirstOrThrow,
      'User should not be created with invalid email format',
    );

    await rejects(
      db.selectFrom('emails').selectAll().where('to', '=', email)
        .executeTakeFirstOrThrow,
      'Email should not be queued with invalid email format',
    );
  });

  await test('POST /signup - password mismatch - 400 response code', async () => {
    const email = `test-${Date.now()}@test.com`;

    const response = await got.post('signup', {
      json: {
        email,
        password: 'test1234',
        password_confirm: 'test12345', // Mismatched password
      },
    });

    strictEqual(response.statusCode, 400);

    // Check that user and email were not created
    await rejects(
      db.selectFrom('users').selectAll().where('email', '=', email)
        .executeTakeFirstOrThrow,
      'User should not be created with mismatched passwords',
    );

    await rejects(
      db.selectFrom('emails').selectAll().where('to', '=', email)
        .executeTakeFirstOrThrow,
      'Email should not be queued with mismatched passwords',
    );
  });

  await test('POST /login - success - 302 redirect', async () => {
    const response = await got.post('login', {
      form: {
        email: 'superuser@kosmic.com',
        password: 'kosmic',
      },
    });

    strictEqual(response.statusCode, 302);
  });

  await test('POST /login - invalid email - 400 response', async () => {
    const response = await got.post('login', {
      form: {
        email: 'invalid-email',
        password: 'kosmic',
      },
    });

    strictEqual(response.statusCode, 401);
  });

  after(async () => {
    await migrator.migrateTo(NO_MIGRATIONS);
    server.closeAllConnections();
    server.close();
  });
});
