import pkg from 'pg';
import logger from '#utils/logger.js';
import {config} from '#config/index.js';

const {Pool} = pkg;

export const pool = new Pool({
  ...config.pg,
});

pool.on('connect', () => {
  logger.trace('postgres connected');
});

pool.on('error', (error) => {
  logger.error(error);
});

pool.on('release', () => {
  logger.trace('postgres release');
});

pool.on('remove', () => {
  logger.trace('postgres removed');
});

pool.on('acquire', () => {
  logger.trace('postgres acquired');
});
