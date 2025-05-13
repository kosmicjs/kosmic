/* eslint-disable unicorn/prefer-module */
import path from 'node:path';
import {type UserConfig, createLogger} from 'vite';
import {pino} from 'pino';
// import kosmic from './scripts/vite-plugin.js';
import {config as kosmicConfig} from './src/config/index.js';

const viteLogger = pino({
  name: '~vite~',
  ...(kosmicConfig.kosmicEnv === 'production'
    ? {}
    : {transport: {target: 'pino-princess'}}),
});

const config: UserConfig = {
  // plugins: [kosmic({port: kosmicConfig.port})],
  root: path.join(__dirname, 'src', 'client'),
  build: {
    manifest: true,
    rollupOptions: {
      input: path.join(__dirname, 'src', 'client', 'scripts', 'index.ts'),
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
        api: 'modern',
        silenceDeprecations: [
          'mixed-decls',
          'color-functions',
          'global-builtin',
          'import',
        ],
      },
    },
  },
};

export default config;
