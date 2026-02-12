#!/usr/bin/env node
/* eslint-disable no-await-in-loop */
import process from 'node:process';
import previewEmail from 'preview-email';
import nodemailer from 'nodemailer';
import {db} from '#db/index.js';
import {jobsLogger as logger} from '#utils/logger.js';
import {config} from '#config/index.js';

logger.info('Starting emails job');

const transport = nodemailer.createTransport(config.nodeMailer);

const unsentEmails = await db
  .selectFrom('emails')
  .selectAll()
  .where('sent_at', 'is', null)
  .execute();

for (const email of unsentEmails) {
  logger.debug({email}, 'Sending email');

  const {id, to, from, subject, html, text} = email;

  const message = {
    to: to ?? '',
    from: from ?? '',
    subject: subject ?? '',
    html: html ?? '',
    text: text ?? '',
    attachments: [],
  };

  try {
    await previewEmail(message);
    await transport.sendMail(message);
    await db
      .updateTable('emails')
      .where('id', '=', id)
      .set({
        sent_at: new Date(),
        status: 'sent',
      })
      .execute();
    logger.info({id}, 'Email sent successfully');
  } catch (error) {
    await db
      .updateTable('emails')
      .where('id', '=', id)
      .set({
        sent_at: new Date(),
        status: 'failed',
      })
      .execute();
    logger.error(error, 'Error sending email');
  }
}

logger.info('Emails job completed successfully');

process.exit(0);
