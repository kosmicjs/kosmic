import process from 'node:process';
import fs from 'node:fs/promises';
import {build} from 'vite';
import {PurgeCSS} from 'purgecss';

async function buildEmailCSS() {
  const root = process.cwd();

  const buildResult = await build({
    root,
    configFile: false,
    mode: 'production',
    build: {
      outDir: './node_modules/.kosmic/email-css',
      rollupOptions: {
        input: './src/client/styles/styles.scss',
      },
    },
  });

  if (Array.isArray(buildResult) || !('output' in buildResult))
    throw new Error(
      'Expected a single build result, but got an array or build watcher instance.',
    );

  const purgeCSSResult = await new PurgeCSS().purge({
    content: [`${root}/src/emails/**/*.tsx`],
    css: [
      {
        raw: await fs.readFile(
          `${root}/node_modules/.kosmic/email-css/${buildResult.output[0].fileName}`,
          'utf8',
        ),
      },
    ],
  });

  return purgeCSSResult;
}

await buildEmailCSS();
