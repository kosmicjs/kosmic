import type {Middleware} from 'koa';
import Stripe from 'stripe';
import {config} from '#config/index.js';

const stripe = config.stripe?.secretKey
  ? new Stripe(config.stripe.secretKey)
  : undefined;

export const post: Middleware = stripe
  ? async (ctx, next) => {
      if (!config.stripe?.endpointSecret) {
        throw new Error('Stripe endpoint secret not defined.');
      }

      if (!config.stripe?.secretKey) {
        throw new Error('Stripe secret key not defined.');
      }

      // Only verify the event if you have an endpoint secret defined.
      // Otherwise use the basic event deserialized with JSON.parse
      // Get the signature sent by Stripe
      const signature = ctx.headers['stripe-signature'];

      if (!signature) {
        throw new Error('Webhook signature missing.');
      }

      if (!ctx.request.rawBody) {
        throw new Error('Request body missing.');
      }

      const event = stripe.webhooks.constructEvent(
        ctx.request.rawBody,
        signature,
        config.stripe.endpointSecret,
      );

      if (!event) {
        ctx.status = 400;
        return;
      }

      // Handle the event
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (event.type) {
        default: {
          // Unexpected event type
          ctx.log.warn(`Unhandled event type ${event.type}.`);
        }
      }

      // Return a 200 response to acknowledge receipt of the event
      ctx.status = 200;
    }
  : async (ctx, next) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return next();
    };
