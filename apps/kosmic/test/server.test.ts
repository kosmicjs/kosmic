import type {Server} from 'node:http';
import {describe, test, before, after} from 'node:test';
import path from 'node:path';
import assert from 'node:assert';
import _got from 'got';
import * as cheerio from 'cheerio';
import {NO_MIGRATIONS} from 'kysely';
import {CookieJar} from 'tough-cookie';
import {createMigrator} from '@kosmic/cli/migrate';
import {createServer} from '../src/server.ts';
import {db} from '#db/index.js';
import {logger} from '#utils/logger.js';

const migrator = createMigrator({
  db,
  logger,
  migrationsPath: path.resolve(
    import.meta.dirname,
    '..',
    'src',
    'db',
    'migrations.js',
  ),
});

await describe('server integration', async () => {
  let server: Server;

  const got = _got.extend({
    prefixUrl: 'http://localhost:4567',
    throwHttpErrors: false,
    cookieJar: new CookieJar(),
    followRedirect: false,
  });

  before(async () => {
    await migrator.migrateToLatest();
    server = await createServer();
    server.listen(4567);
  });

  await test('GET / 200 ok', async () => {
    const response = await got('');

    assert.strictEqual(response.statusCode, 200);

    const $ = cheerio.load(response.body);
    const $h1 = $('h1');
    assert.strictEqual($h1.length, 1);
    assert.strictEqual($h1.text(), 'Kosmic');
  });

  await test('Get / 404 not found returns expected response', async () => {
    const response = await got('404', {
      throwHttpErrors: false,
    });
    assert.strictEqual(response.statusCode, 404);
    assert.strictEqual(response.body, 'Not Found');
  });

  await test('Get /docs 302 redirects to /docs/installation', async () => {
    const response = await got('docs', {
      throwHttpErrors: false,
      followRedirect: false,
    });
    assert.strictEqual(response.statusCode, 302);
  });

  await test('Get /account - no auth - 401 response', async () => {
    const response = await got('account', {
      throwHttpErrors: false,
      followRedirect: false,
    });
    assert.strictEqual(response.statusCode, 302);
  });

  await test('POST /signup - 201 success', async () => {
    const email = `test-${Date.now()}@test.com`;

    const response = await got.post('signup', {
      json: {
        email,
        password: 'Test@1234',
        password_confirm: 'Test@1234',
      },
    });

    assert.strictEqual(response.statusCode, 201);
    assert.strictEqual(response.headers['hx-redirect'], '/account');

    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirstOrThrow();

    assert.strictEqual(user.email, email);
    assert.strictEqual(user.first_name, null);
    assert.strictEqual(user.last_name, null);

    const welcomeEmail = await db
      .selectFrom('emails')
      .selectAll()
      .where('to', '=', email)
      .executeTakeFirst();

    assert.strictEqual(welcomeEmail?.to, email);
    assert.strictEqual(welcomeEmail?.status, 'pending');
  });

  await test('GET /account - 200 response', async () => {
    const response = await got('account');
    assert.strictEqual(response.statusCode, 200);
  });

  await test('GET /logout - 302 response', async () => {
    const response = await got('logout');
    assert.strictEqual(response.statusCode, 302);
  });

  await test('POST /signup - invalid email - 400 response', async () => {
    const email = `test-${Date.now()}@test`;

    const response = await got.post('signup', {
      json: {
        email,
        password: 'Test1234',
        password_confirm: 'Test1234',
      },
    });

    assert.strictEqual(response.statusCode, 400);

    // Check that the response contains the expected error messages in the HTML
    const $ = cheerio.load(response.body);
    const errorInput = $('input.is-invalid');
    assert.strictEqual(
      errorInput.length,
      1,
      'There should be one invalid input field for email',
    );
    assert.strictEqual(
      $(errorInput).attr('name'),
      'email',
      'Invalid input should be for email',
    );
    assert.strictEqual(
      $(errorInput).siblings('.invalid-feedback').text(),
      'Invalid email address',
      'Invalid email error message should be displayed',
    );

    await assert.rejects(
      db.selectFrom('users').selectAll().where('email', '=', email)
        .executeTakeFirstOrThrow,
      'User should not be created with invalid email format',
    );

    await assert.rejects(
      db.selectFrom('emails').selectAll().where('to', '=', email)
        .executeTakeFirstOrThrow,
      'Email should not be queued with invalid email format',
    );
  });

  await test('POST /signup - password mismatch - 400 response', async () => {
    const email = `test-${Date.now()}@test.com`;

    const response = await got.post('signup', {
      json: {
        email,
        password: 'test1234',
        password_confirm: 'test12345', // Mismatched password
      },
    });

    assert.strictEqual(response.statusCode, 400);

    const $ = cheerio.load(response.body);

    const errorInput = $('input.is-invalid');

    assert.strictEqual(
      errorInput.length,
      1,
      'There should be one invalid input field for password confirmation',
    );
    assert.strictEqual(
      $(errorInput).attr('name'),
      'password_confirm',
      'Invalid input should be for password confirmation',
    );

    assert.strictEqual(
      $(errorInput).siblings('.invalid-feedback').text(),
      'Password and password confirmation do not match',
      'Password mismatch error message should be displayed',
    );

    // Check that user and email were not created
    await assert.rejects(
      db.selectFrom('users').selectAll().where('email', '=', email)
        .executeTakeFirstOrThrow,
      'User should not be created with mismatched passwords',
    );

    await assert.rejects(
      db.selectFrom('emails').selectAll().where('to', '=', email)
        .executeTakeFirstOrThrow,
      'Email should not be queued with mismatched passwords',
    );
  });

  await test('POST /login - success - 200', async () => {
    const response = await got.post('login', {
      form: {
        email: 'superuser@kosmic.com',
        password: 'kosmic',
      },
    });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.headers['hx-redirect'], '/account');
  });

  await test('POST /login - invalid email - 401 response', async () => {
    const response = await got.post('login', {
      form: {
        email: 'invalid-email',
        password: 'kosmic',
      },
    });

    assert.strictEqual(response.statusCode, 401);
    assert.strictEqual(response.headers['hx-redirect'], '/login');
  });

  await test('GET /api/me - 401 unauthorized', async () => {
    const response = await got.get('api/me');
    assert.strictEqual(response.statusCode, 401);
    assert.strictEqual(response.body, 'Unauthorized');
  });

  // TODO: Extract api key from migrations or use a test key
  await test.skip('GET /api/me - 200 ok with auth', async () => {
    const loginResponse = await got.post('api/me', {
      headers: {
        Authorization: 'Bearer kosmic',
      },
    });

    assert.strictEqual(loginResponse.statusCode, 200);
  });

  after(async () => {
    await migrator.migrateTo(NO_MIGRATIONS);
    server.closeAllConnections();
    server.close();
  });
});
