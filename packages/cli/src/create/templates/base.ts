export const baseTemplateFiles: Record<string, string> = {
  '.env.example': `# Server settings
PORT=3000
SERVER_HOST=127.0.0.1
LOG_LEVEL=info
`,
  '.gitignore': `node_modules
dist
.env
`,
  'README.md': `# {{projectName}}

A minimal Kosmic application scaffolded with the create command.

## Scripts

- npm run dev
- npm run build
- npm run start
- npm run lint

## Development

1. Copy .env.example to .env.
2. Run npm install.
3. Run npm run dev.
`,
  'package.json': `{
  "name": "{{projectName}}",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "dist/src/index.js",
  "scripts": {
    "build": "kosmic build",
    "check": "tsc --noEmit",
    "dev": "kosmic dev",
    "lint": "xo",
    "start": "kosmic start",
    "test": "node --test"
  },
  "dependencies": {
    "@kosmic/cli": "latest",
    "@kosmic/config": "latest",
    "@kosmic/logger": "latest",
    "@kosmic/server": "latest"
  },
  "devDependencies": {
    "@types/node": "~25.5.0",
    "typescript": "~5.9.3",
    "vite": "^8.0.3",
    "xo": "^1.2.3"
  },
  "engines": {
    "node": ">=22"
  }
}
`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
}
`,
  'vite.config.ts': `/* eslint-disable unicorn/prefer-module */
import path from 'node:path';
import type {UserConfig} from 'vite';

const config: UserConfig = {
  root: path.join(__dirname, 'src', 'client'),
  build: {
    manifest: true,
    rollupOptions: {
      input: path.join(__dirname, 'src', 'client', 'scripts', 'index.ts'),
    },
    outDir: path.join(__dirname, 'dist', 'src', 'public'),
    emptyOutDir: true,
  },
};

export default config;
`,
  'src/index.ts': `import process from 'node:process';
import {config} from '@kosmic/config';
import {logger} from '@kosmic/logger';
import {kosmicServer} from './server.ts';

const server = await kosmicServer.listen(config.port, config.host);

logger.info(\`Server listening on \${config.host}:\${config.port}\`);

if (process.send) {
  process.send({status: 'ready'});
}

process.on('unhandledRejection', (error) => {
  throw error;
});

process.on('uncaughtException', (error) => {
  logger.error(error);
  process.exit(1);
});

process.on('beforeExit', () => {
  logger.info('Server shutting down');
  server.closeAllConnections();
  server.close(() => {
    process.exit(0);
  });
});
`,
  'src/server.ts': `import path from 'node:path';
import {KosmicServer} from '@kosmic/server';

export const kosmicServer = new KosmicServer({
  routesDir: path.join(import.meta.dirname, 'routes'),
});

/**
 * Return the app singleton.
 */
export function getServer(): KosmicServer {
  return kosmicServer;
}
`,
  'src/routes/index.ts': `import type {Context} from '@kosmic/server';

/**
 * Render the default landing page.
 */
export async function get(ctx: Context) {
  ctx.type = 'html';
  ctx.body = \`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{projectName}}</title>
    <style>
      :root {
        --bg: #f6f7fb;
        --card: #ffffff;
        --text: #14213d;
        --muted: #5f6c80;
        --accent: #fca311;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        color: var(--text);
        background: radial-gradient(circle at 20% 20%, #fff9eb 0%, var(--bg) 50%);
      }

      main {
        max-width: 42rem;
        padding: 2rem;
      }

      section {
        background: var(--card);
        border-radius: 14px;
        box-shadow: 0 12px 36px rgb(20 33 61 / 0.12);
        padding: 2rem;
      }

      h1 {
        margin-top: 0;
        font-size: 2rem;
      }

      p {
        color: var(--muted);
        line-height: 1.6;
      }

      code {
        background: #fff1d1;
        border-radius: 6px;
        padding: 0.2rem 0.4rem;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>{{projectName}}</h1>
        <p>
          Your Kosmic app is ready. Edit <code>src/routes/index.ts</code> to start
          building your first route.
        </p>
      </section>
    </main>
  </body>
</html>\`;
}
`,
  'src/public/.gitkeep': '',
  'src/client/scripts/index.ts': `import '../styles/styles.css';
`,
  'src/client/styles/styles.css': `:root {
  color-scheme: light;
}
`,
};
