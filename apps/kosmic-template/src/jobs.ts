import process from 'node:process';
import {CronJob} from 'cron';
import {execa} from 'execa';
import {logger as serverLogger} from '#utils/logger.js';

const logger = serverLogger.child({
  name: '~jobs~',
});

const $ = execa({stdio: 'inherit', cwd: process.cwd()});

const emailsJob = new CronJob(
  '*/10 * * * * *', // => every 10s
  async function () {
    try {
      await $`node ./dist/src/jobs/emails.js`;
    } catch (error) {
      logger.error(error, 'Error running cron job');
    }
  },
  null,
  false,
  'America/New_York',
);

emailsJob.start();

logger.info('Cron jobs started');

// throw to bubble up to uncaughtException
process.on('unhandledRejection', async (error) => {
  throw error;
});

// exit on exception
process.on('uncaughtException', (error) => {
  logger.error(error);
  process.exit(1);
});
