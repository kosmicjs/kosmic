/* eslint-disable no-console */
import {$, type ResultPromise} from 'execa';
import {
  waitForPortToBeTaken,
  waitForPortToBeFree,
} from './wait-on-port-taken.js';

const abortController = new AbortController();
const {signal} = abortController;

let server:
  | ResultPromise<{
      stdio: 'inherit';
      signal: AbortSignal;
    }>
  | undefined;

export async function startServer(port: number) {
  server = $({
    stdio: 'inherit',
    signal,
  })`node dist/src/index.js`;

  await waitForPortToBeTaken(port);

  return abortController.abort;
}

export async function stopServer(port: number) {
  abortController.abort();

  try {
    await server;
  } catch (error) {
    console.log('Server process was killed', error);
  }

  await waitForPortToBeFree(port);
}
