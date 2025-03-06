import {type WebSocketServer} from 'vite';
import waitOn from 'wait-on';
import {$, type ResultPromise} from 'execa';

const $$ = $({stdio: 'inherit'});
let serverProcess: ResultPromise<{stdio: 'inherit'}> | undefined;
let isRestarting = false;

export const startOrRestartServer = async (ws?: WebSocketServer) => {
  if (isRestarting) {
    return;
  }

  isRestarting = true;

  serverProcess?.kill();

  await waitOn({
    resources: ['tcp:127.0.0.1:3000'],
    timeout: 5000,
    tcpTimeout: 1000,
    reverse: true,
  });

  await waitOn({
    resources: ['file:dist/src/index.js'],
  });

  serverProcess = $$`node dist/src/index.js`;

  // eslint-disable-next-line promise/prefer-await-to-then, @typescript-eslint/no-empty-function
  serverProcess.catch(() => {});

  await waitOn({
    resources: ['tcp:127.0.0.1:3000'],
    reverse: true,
    tcpTimeout: 1000,
    timeout: 5000,
  });

  isRestarting = false;

  if (ws) {
    ws.send({type: 'full-reload', path: '*'});
  }
};
