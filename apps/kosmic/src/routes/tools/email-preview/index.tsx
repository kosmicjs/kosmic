import fs from 'node:fs/promises';
import path from 'node:path';
import type {Middleware} from '@kosmic/server';
import {Layout} from '#components/layout.js';

export const get: Middleware = async (ctx) => {
  const emailDir = await fs.readdir(
    path.join(import.meta.dirname, '..', '..', '..', 'emails'),
  );

  const emailFiles = emailDir.filter((file) => file.endsWith('.js'));

  await ctx.render(
    <Layout>
      <h1>Email Editor</h1>
      <ul>
        {emailFiles.map((file) => (
          <li key={file}>
            <a href={`/tools/email-preview/${file.replace('.js', '')}`}>
              {path.basename(file)}
            </a>
          </li>
        ))}
      </ul>
    </Layout>,
  );
};
