import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import colors from 'picocolors';
import picomatch from 'picomatch';
import {normalizePath, type Plugin} from 'vite';
import chokidar from 'chokidar';
import pDebounce from 'p-debounce';
import {tsWatch} from './vite-plugin/ts-watch.js';
import {startOrRestartServer} from './vite-plugin/start-or-restart-server.js';
/**
 * Allows to automatically reload the page when a watched file changes.
 * @param paths - The file paths to watch.
 * @param config - The plugin configuration.
 */
const vitePluginFullReload = (): Plugin => {
  function normalizePaths(root: string, fp: string | string[]) {
    return (Array.isArray(fp) ? fp : [fp])
      .map((fp) => path.resolve(root, fp))
      .map((element) => normalizePath(element));
  }

  return {
    name: 'vite-plugin-kosmic',
    apply: 'serve',
    // NOTE: Enable globbing so that Vite keeps track of the template files.
    config: () => ({server: {watch: {disableGlobbing: false}}}),

    async configureServer({watcher, ws, config: {logger}}) {
      const root = process.cwd();

      const distFolder = path.resolve(root, 'dist');

      const publicFolder = path.resolve(distFolder, 'src', 'public');

      await fs.rm(path.resolve(root, 'dist'), {recursive: true, force: true});

      tsWatch();

      const files = normalizePaths(root, [
        path.join('dist', 'src', '**', '*.js'),
      ]);

      const shouldReload = picomatch(files);

      const checkReload = pDebounce(async (fp: string) => {
        if (shouldReload(fp)) {
          await startOrRestartServer(ws);
          logger.info(
            `${colors.green('Full Reload')} ${colors.dim(path.relative(distFolder, fp))}`,
          );
        }
      }, 150);

      watcher.add(files);
      watcher.on('add', checkReload);
      watcher.on('change', checkReload);

      await fs.cp(path.resolve(root, 'src', 'public'), publicFolder, {
        recursive: true,
      });

      chokidar
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

      await startOrRestartServer();
    },
  };
};

export default vitePluginFullReload;
