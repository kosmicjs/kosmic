/* eslint-disable no-console */
import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import colors from 'picocolors';
import picomatch from 'picomatch';
import {normalizePath, type Plugin} from 'vite';
import chokidar, {type FSWatcher} from 'chokidar';
import pDebounce from 'p-debounce';
import Queue from 'queue';
import waitOn from 'wait-on';
import {$, type ResultPromise} from 'execa';
import type ts from 'typescript';
import {tsWatch} from './vite-plugin/ts-watch.js';

function normalizePaths(root: string, fp: string | string[]) {
  return (Array.isArray(fp) ? fp : [fp])
    .map((fp) => path.resolve(root, fp))
    .map((element) => normalizePath(element));
}

/**
 * Allows to automatically reload the page when a watched file changes.
 */
const vitePluginFullReload = ({
  port = 3000,
}: {port?: string | number} = {}): Plugin => {
  // a queue to ensure only 1 server is running at a time
  const q = new Queue({
    results: [],
    autostart: true,
    concurrency: 1,
    timeout: 0,
  });

  let serverProcess: ResultPromise<{stdio: 'inherit'}> | undefined;

  let program: ts.WatchOfConfigFile<ts.EmitAndSemanticDiagnosticsBuilderProgram>;

  let publicwatcher: FSWatcher;

  q.addEventListener('start', (job) => {
    console.log(job);
  });

  q.addEventListener('success', (job) => {
    console.log(job);
  });

  q.addEventListener('end', (job) => {
    console.log(job);
  });

  const waitOnConfig = {
    resources: [`tcp:127.0.0.1:${port}`, `http://127.0.0.1:${port}`],
    timeout: 5000,
    tcpTimeout: 1000,
  };

  async function cleanup() {
    console.log('cleanup called...');
    program?.close();
    serverProcess?.kill();
    await waitOn({...waitOnConfig, reverse: true});
    await publicwatcher?.close();
    q?.end();
  }

  return {
    name: 'vite-plugin-kosmic',
    apply: 'serve',

    // NOTE: Enable globbing so that Vite keeps track of the template files.
    config: () => ({server: {watch: {disableGlobbing: false}}}),

    /**
     * The main function for the plugin.
     */
    async configureServer({watcher, ws, config: {logger}}) {
      console.log('configureServer called...');
      await cleanup();

      const $$ = $({stdio: 'inherit'});

      const root = process.cwd();

      const distFolder = path.resolve(root, 'dist');

      const publicFolder = path.resolve(distFolder, 'src', 'public');

      await fs.rm(path.resolve(root, 'dist'), {recursive: true, force: true});

      program = tsWatch();

      const files = normalizePaths(root, [
        path.join('dist', 'src', '**', '*.js'),
      ]);

      const shouldReload = picomatch(files);

      const checkReload = pDebounce(async (fp: string) => {
        if (shouldReload(fp)) {
          serverProcess?.kill();

          q.push(async () => {
            // Wait for the file to be written to disk.
            await waitOn({
              resources: ['file:dist/src/index.js'],
            });

            // ensure the port is available
            await waitOn({...waitOnConfig, reverse: true});

            // start the server
            serverProcess = $$`node dist/src/index.js`;

            // // wait on the port to be used by the server
            // await waitOn({...waitOnConfig, reverse: false});

            ws.send({type: 'full-reload', path: '*'});

            logger.info(
              `${colors.green('Full Reload')} ${colors.dim(path.relative(distFolder, fp))}`,
            );

            try {
              await serverProcess;
            } catch {}

            // wait on the port to become available
            await waitOn({...waitOnConfig, reverse: true});
          });
        }
      }, 150);

      watcher.add(files);
      watcher.on('add', checkReload);
      watcher.on('change', checkReload);

      await fs.cp(path.resolve(root, 'src', 'public'), publicFolder, {
        recursive: true,
      });

      publicwatcher = chokidar
        .watch(path.join(root, 'src', 'public'), {
          ignored: (fp, stats) => !stats?.isFile(),
        })
        .on('all', async (event, fp) => {
          if (['add', 'change'].includes(event)) {
            await fs.mkdir(publicFolder, {recursive: true});
            await fs.copyFile(fp, path.join(publicFolder, path.basename(fp)));
          }

          if (event === 'unlink') {
            await fs.unlink(path.join(publicFolder, path.basename(fp)));
          }
        });
    },
  };
};

export default vitePluginFullReload;
