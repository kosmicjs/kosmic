import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import colors from 'picocolors';
import picomatch from 'picomatch';
import {normalizePath, type Plugin} from 'vite';
import pDebounce from 'p-debounce';
import {
  waitForPortToBeTaken,
  waitForPortToBeFree,
} from './vite-plugin/wait-on-port-taken.js';

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
  return {
    name: 'vite-plugin-kosmic',
    apply: 'serve',

    // NOTE: Enable globbing so that Vite keeps track of the template files.
    config: () => ({
      server: {watch: {disableGlobbing: false}},
    }),

    /**
     * The main function for the plugin.
     *
     * configureServer runs before buildStart and is ran before the previou buildEnd is called
     */
    async configureServer({watcher, ws, config: {logger}}) {
      const root = process.cwd();

      const distFolder = path.resolve(root, 'dist');
      const publicFolder = path.resolve(distFolder, 'src', 'public');
      const files = normalizePaths(root, [
        path.join('dist', 'src', '**', '*.js'),
      ]);
      const shouldReload = picomatch(files, {
        ignore: ['**/node_modules/**', '**/vite.config.*/**', '**/scripts/**'],
      });

      const checkReload = pDebounce(async (fp: string) => {
        if (!shouldReload(fp)) {
          return;
        }

        await waitForPortToBeFree(Number(port));
        await waitForPortToBeTaken(Number(port));
        ws.send({type: 'full-reload', path: '*'});
        logger.info(
          `${colors.green('Full Reload')} ${colors.dim(path.relative(distFolder, fp))}`,
        );
      }, 200);

      watcher.add(files);
      watcher.on('add', checkReload);
      watcher.on('change', checkReload);

      await fs.cp(path.resolve(root, 'src', 'public'), publicFolder, {
        recursive: true,
      });
    },
  };
};

export default vitePluginFullReload;
