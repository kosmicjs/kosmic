import Stripe from 'stripe';
import {config} from '../../config/index.js';
import {type Use} from '#middleware/router/types.js';

const stripe = config.stripe?.secretKey
  ? new Stripe(config.stripe.secretKey)
  : undefined;

declare module 'koa' {
  interface DefaultState {
    session?: Stripe.Checkout.Session;
  }
}

const YOUR_DOMAIN = 'http://localhost:3000';

export const use: Use = [
  stripe
    ? // eslint-disable-next-line func-names
      async function getStripeSession(ctx, next) {
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price: config.stripe?.priceId ?? '',
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${YOUR_DOMAIN}/`,
          cancel_url: `${YOUR_DOMAIN}/`,
        });

        ctx.state.session = session;

        await next();
      }
    : async (ctx, next) => {
        await next();
      },
];
