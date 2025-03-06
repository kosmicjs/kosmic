/* eslint-disable no-console */
import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs';
import colors from 'picocolors';
import picomatch from 'picomatch';
import {normalizePath, type Plugin} from 'vite';
import {watchMain} from './vite-plugin/ts-watch.js';
import {startOrRestartServer} from './vite-plugin/start-or-restart-server.js';

/**
 * Allows to automatically reload the page when a watched file changes.
 * @param paths - The file paths to watch.
 * @param config - The plugin configuration.
 */
const vitePluginFullReload = (): Plugin => {
  fs.rmSync('dist', {recursive: true, force: true});

  function normalizePaths(root: string, fp: string | string[]) {
    return (Array.isArray(fp) ? fp : [fp])
      .map((fp) => path.resolve(root, fp))
      .map((element) => normalizePath(element));
  }

  return {
    name: 'vite-plugin-full-reload',
    // apply: 'serve',
    // NOTE: Enable globbing so that Vite keeps track of the template files.
    config: () => ({server: {watch: {disableGlobbing: false}}}),

    async configureServer({watcher, ws, config: {logger}}) {
      watchMain();
      const root = process.cwd();

      const files = normalizePaths(root, [
        path.join('dist', 'src', '**', '*.js'),
      ]);

      const shouldReload = picomatch(files);

      const checkReload = async (fp: string) => {
        console.log('detected change', fp);
        if (shouldReload(fp)) {
          await startOrRestartServer(ws);
          logger.info(
            `${colors.green('Full Reload')} ${colors.dim(path.relative(root, fp))}`,
            {clear: true, timestamp: true},
          );
        }
      };

      watcher.add(files);
      watcher.on('add', checkReload);
      watcher.on('change', checkReload);
      await startOrRestartServer();
    },
  };
};

export default vitePluginFullReload;
