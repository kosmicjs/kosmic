import process from 'node:process';
import {config} from '@kosmic/config';
import {logger} from './utils/logger.ts';
import {getServer} from './server.ts';

const kosmicServer = getServer();

const server = await kosmicServer.listen(config.port, config.host);

logger.info(`Server listening on ${config.host}:${config.port}`);
if (process.send) process.send({status: 'ready'});

// throw to bubble up to uncaughtException
process.on('unhandledRejection', async (error) => {
  throw error;
});

// exit on exception
process.on('uncaughtException', (error) => {
  logger.error(error);
  process.exit(1);
});

// gracefully close server on all exits
process.on('beforeExit', () => {
  logger.info('Server shutting down');
  server.closeAllConnections();
  server.close(() => {
    process.exit(0);
  });
});
