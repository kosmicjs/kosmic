import path from 'node:path';
import fs from 'node:fs/promises';
import chokidar from 'chokidar';

const publicDistPath = path.resolve(
  import.meta.dirname,
  '..',
  '..',
  'dist',
  'src',
  'public',
);

chokidar
  .watch(path.join(import.meta.dirname, '../src/public'), {
    ignored: (fp, stats) => !stats?.isFile(),
  })
  .on('all', async (event, fp) => {
    // eslint-disable-next-line no-console
    console.log(event, fp);

    if (['add', 'change'].includes(event)) {
      await fs.mkdir(publicDistPath, {recursive: true});
      await fs.copyFile(fp, path.join(publicDistPath, path.basename(fp)));
    }

    if (event === 'unlink') {
      await fs.unlink(path.join(publicDistPath, path.basename(fp)));
    }
  });
