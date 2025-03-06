import {type WebSocketServer} from 'vite';
import waitOn from 'wait-on';
import {$, type ResultPromise} from 'execa';

const $$ = $({stdio: 'inherit'});
let serverProcess: ResultPromise<{stdio: 'inherit'}> | undefined;
let isRestarting = false;

const waitOnConfig = {
  resources: ['tcp:127.0.0.1:3000', 'http://127.0.0.1:3000'],
  timeout: 5000,
  tcpTimeout: 1000,
  reverse: true,
};

export const startOrRestartServer = async (ws?: WebSocketServer) => {
  if (isRestarting) {
    return;
  }

  isRestarting = true;
  serverProcess?.kill();
  await waitOn(waitOnConfig);
  await waitOn({
    resources: ['file:dist/src/index.js'],
  });
  serverProcess = $$`node dist/src/index.js`;
  // eslint-disable-next-line promise/prefer-await-to-then, @typescript-eslint/no-empty-function
  serverProcess.catch(() => {});
  await waitOn(waitOnConfig);
  isRestarting = false;

  if (ws) {
    ws.send({type: 'full-reload', path: '*'});
  }
};
