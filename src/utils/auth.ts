import {betterAuth} from 'better-auth';
import {db} from '#db/index.js';
import {queueEmailVerification, queuePasswordReset} from '#models/emails.js';
import {config} from '#config/index.js';

export const auth = betterAuth({
  database: db,
  secret: config.betterAuth.secret,
  baseURL: config.betterAuth.baseURL,
  user: {
    modelName: 'users',
    fields: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      emailVerified: 'email_verified',
    },
  },
  session: {
    modelName: 'sessions',
    fields: {
      userId: 'user_id',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
    },
  },
  account: {
    modelName: 'accounts',
    fields: {
      userId: 'user_id',
      providerId: 'provider_id',
      accountId: 'account_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    modelName: 'verification',
    fields: {
      identifier: 'identifier',
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({user, url}) {
      // Use your existing email queue system for password reset emails
      await queuePasswordReset(Number(user.id), user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    async sendVerificationEmail({user, url}) {
      // Use your existing email queue system for verification emails
      await queueEmailVerification(Number(user.id), user.email, url);
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
});
