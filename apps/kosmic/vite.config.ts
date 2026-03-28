/* eslint-disable unicorn/prefer-module */
import path from 'node:path';
import {type UserConfig, createLogger} from 'vite'; // eslint-disable-line import-x/no-extraneous-dependencies, n/no-extraneous-import
import {createLogger as createKosmicLogger} from '@kosmic/logger';

const viteLogger = createKosmicLogger({
  name: '~vite~',
});

const config: UserConfig = {
  // plugins: [kosmic({port: kosmicConfig.port})],
  root: path.join(__dirname, 'src', 'client'),
  build: {
    manifest: true,
    rollupOptions: {
      input: path.join(__dirname, 'src', 'client', 'scripts', 'index.ts'),
      external: 'highlight.js',
    },
    outDir: path.join(__dirname, 'dist', 'src', 'public'),
    emptyOutDir: true,
  },
  customLogger: {
    ...createLogger(),
    info: viteLogger.info.bind(viteLogger),
    warn: viteLogger.warn.bind(viteLogger),
    error: viteLogger.error.bind(viteLogger),
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'color-functions',
          'global-builtin',
          'import',
          'if-function',
        ],
      },
    },
  },
};

export default config;
