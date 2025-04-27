import {CronJob} from 'cron';
import {$} from 'execa';
import {logger as serverLogger} from '#utils/logger.js';

const logger = serverLogger.child({
  name: '~jobs~',
});

const job = new CronJob(
  '* * * * *', // => every 30s i think
  async function () {
    try {
      logger.debug('Starting email job');
      await $`node ./dist/src/jobs/emails.js`;
    } catch (error) {
      logger.error(error, 'Error running cron job');
    }
  },
  null,
  false,
  'America/New_York',
);

job.start();

logger.info('Cron jobs started');
